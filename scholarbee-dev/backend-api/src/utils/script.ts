import { MongoClient, ObjectId } from "mongodb";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "";

if (!MONGODB_URI) throw new Error("Couldn't find mongodb_uri");

// log the truncated MONGODB_URI
console.log(MONGODB_URI?.slice(0, 20));

interface Program {
    _id: ObjectId;
    name: string;
    fee_structure?: ObjectId;
}

interface FeeStructure {
    _id: ObjectId;
    program_id: string;
    title?: string;
    tuition_fee: number;
    application_fee?: number;
    currency?: string;
    payment_schedule?: string;
    other_fees?: Array<{
        fee_name: string;
        fee_amount: number;
        include_in_first_semester?: boolean;
    }>;
    created_at: Date;
    createdBy?: ObjectId;
}

function saveInOutput(data: any, filename: string): string {
    const outputDir = path.join(__dirname, "..", "output");
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    const outputPath = path.join(outputDir, `${filename}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
    return outputPath;
}

async function migrateProgramFeeStructures() {
    const client = new MongoClient(MONGODB_URI);

    try {
        await client.connect();
        console.log("Connected to MongoDB");

        const db = client.db();
        const programsCollection = db.collection("programs");
        const feeStructuresCollection = db.collection("fee_structures");

        // Step 1: Find all fee structures with program_id and create a mapping
        console.log("Step 1: Finding fee structures with program_id...");
        const feeStructuresWithProgramId = (await feeStructuresCollection
            .find({
                program_id: { $exists: true, $ne: null },
            })
            .toArray()) as FeeStructure[];

        console.log(
            `Found ${feeStructuresWithProgramId.length} fee structures with program_id`
        );

        // Save fee structures data for analysis
        const feeStructuresPath = saveInOutput(
            feeStructuresWithProgramId,
            "fee-structures-with-program-id"
        );
        console.log(`Fee structures data saved to: ${feeStructuresPath}`);

        // Step 2: Create a mapping of program_id to fee_structure_id
        // Handle duplicates: if multiple fee structures reference the same program,
        // we'll use the first one (earliest by _id)
        console.log("Step 2: Creating program to fee structure mapping...");
        const programToFeeStructureMap = new Map<string, ObjectId>();
        const duplicatePrograms = new Set<string>();

        for (const feeStructure of feeStructuresWithProgramId) {
            if (feeStructure.program_id) {
                if (programToFeeStructureMap.has(feeStructure.program_id)) {
                    // This program already has a fee structure, mark as duplicate
                    duplicatePrograms.add(feeStructure.program_id);
                    console.log(
                        `⚠️  Duplicate fee structure found for program ${feeStructure.program_id}: ${feeStructure._id} (keeping first one)`
                    );
                } else {
                    programToFeeStructureMap.set(
                        feeStructure.program_id,
                        feeStructure._id
                    );
                }
            }
        }

        console.log(
            `Created mapping for ${programToFeeStructureMap.size} unique programs`
        );
        console.log(
            `Found ${duplicatePrograms.size} programs with multiple fee structures (using first one)`
        );

        // Save mapping data for analysis
        const mappingData = {
            totalFeeStructures: feeStructuresWithProgramId.length,
            uniquePrograms: programToFeeStructureMap.size,
            duplicatePrograms: Array.from(duplicatePrograms),
            mapping: Object.fromEntries(programToFeeStructureMap),
        };
        const mappingPath = saveInOutput(
            mappingData,
            "program-fee-structure-mapping"
        );
        console.log(`Mapping data saved to: ${mappingPath}`);

        // Step 3: Update fee structures without titles (bulk operation)
        console.log("Step 3: Updating fee structures without titles...");
        const feeStructuresWithoutTitle = feeStructuresWithProgramId.filter(
            (fs) => !fs.title
        );

        if (feeStructuresWithoutTitle.length > 0) {
            // Get program names for fee structures without titles
            console.log(
                "Fetching program names for fee structures without titles..."
            );
            const programIdsForTitles = feeStructuresWithoutTitle.map(
                (fs) => new ObjectId(fs.program_id)
            );
            const programsForTitles = await programsCollection
                .find({ _id: { $in: programIdsForTitles } })
                .project({ _id: 1, name: 1 })
                .toArray();

            // Create a map of program_id to program_name
            const programNameMap = new Map<string, string>();
            programsForTitles.forEach((program) => {
                programNameMap.set(program._id.toString(), program.name);
            });

            const bulkOps = feeStructuresWithoutTitle.map((feeStructure) => {
                const programName =
                    programNameMap.get(feeStructure.program_id) || "Unknown Program";
                return {
                    updateOne: {
                        filter: { _id: feeStructure._id },
                        update: {
                            $set: {
                                title: `${programName} - PKR ${feeStructure.tuition_fee.toLocaleString()}`,
                            },
                        },
                    },
                };
            });

            const titleUpdateResult = await feeStructuresCollection.bulkWrite(
                bulkOps
            );
            console.log(
                `Updated ${titleUpdateResult.modifiedCount} fee structures with default titles`
            );
        } else {
            console.log("All fee structures already have titles");
        }

        // Step 4: Get all program IDs that need to be updated
        const programIdsToUpdate = Array.from(programToFeeStructureMap.keys());
        console.log(
            `Step 4: Found ${programIdsToUpdate.length} programs that need fee_structure field`
        );

        // Step 5: Find programs that don't have fee_structure field yet
        console.log("Step 5: Finding programs without fee_structure field...");
        const programsWithoutFeeStructure = (await programsCollection
            .find({
                _id: { $in: programIdsToUpdate.map((id) => new ObjectId(id)) },
                fee_structure: { $exists: false },
            })
            .toArray()) as Program[];

        console.log(
            `Found ${programsWithoutFeeStructure.length} programs without fee_structure field`
        );

        // Save programs data for analysis
        const programsPath = saveInOutput(
            programsWithoutFeeStructure,
            "programs-without-fee-structure"
        );
        console.log(`Programs data saved to: ${programsPath}`);

        // Step 6: Bulk update programs with fee_structure field
        console.log("Step 6: Bulk updating programs with fee_structure field...");
        if (programsWithoutFeeStructure.length > 0) {
            const bulkOps = programsWithoutFeeStructure
                .map((program) => {
                    const feeStructureId = programToFeeStructureMap.get(
                        program._id.toString()
                    );
                    if (!feeStructureId) {
                        console.log(
                            `⚠️  No fee structure found for program ${program._id}`
                        );
                        return null;
                    }

                    return {
                        updateOne: {
                            filter: { _id: program._id },
                            update: { $set: { fee_structure: feeStructureId } },
                        },
                    };
                })
                .filter((op) => op !== null);

            if (bulkOps.length > 0) {
                const updateResult = await programsCollection.bulkWrite(bulkOps);
                console.log(
                    `Successfully updated ${updateResult.modifiedCount} programs with fee_structure field`
                );
            }
        } else {
            console.log("No programs need to be updated");
        }

        // Step 7: Find orphaned fee structures (fee structures with program_id that don't exist)
        console.log("Step 7: Finding orphaned fee structures...");
        const existingProgramIds = await programsCollection
            .find({ _id: { $in: programIdsToUpdate.map((id) => new ObjectId(id)) } })
            .project({ _id: 1 })
            .toArray();

        const existingProgramIdStrings = existingProgramIds.map((p) =>
            p._id.toString()
        );
        const orphanedFeeStructures = feeStructuresWithProgramId.filter(
            (fs) => !existingProgramIdStrings.includes(fs.program_id)
        );

        console.log(
            `Found ${orphanedFeeStructures.length} orphaned fee structures`
        );

        if (orphanedFeeStructures.length > 0) {
            const orphanedPath = saveInOutput(
                orphanedFeeStructures,
                "orphaned-fee-structures"
            );
            console.log(`Orphaned fee structures saved to: ${orphanedPath}`);
            console.log("Orphaned fee structures:");
            orphanedFeeStructures.forEach((fs) => {
                console.log(
                    `- Fee structure ${fs._id} with program_id: ${fs.program_id}`
                );
            });
        }

        // Step 8: Validation
        console.log("Step 8: Validating migration...");
        const programsWithFeeStructure = await programsCollection.countDocuments({
            fee_structure: { $exists: true, $ne: null },
        });

        const totalPrograms = await programsCollection.countDocuments({});

        console.log("\n=== MIGRATION SUMMARY ===");
        console.log(`Total programs in database: ${totalPrograms}`);
        console.log(
            `Programs with fee_structure field: ${programsWithFeeStructure}`
        );
        console.log(
            `Programs without fee_structure field: ${totalPrograms - programsWithFeeStructure
            }`
        );
        console.log(
            `Fee structures processed: ${feeStructuresWithProgramId.length}`
        );
        console.log(
            `Unique program-fee structure mappings: ${programToFeeStructureMap.size}`
        );
        console.log(
            `Programs with duplicate fee structures: ${duplicatePrograms.size}`
        );
        console.log(`Orphaned fee structures: ${orphanedFeeStructures.length}`);

        if (totalPrograms - programsWithFeeStructure > 0) {
            console.log(
                "\n⚠️  WARNING: Some programs still do not have fee structures!"
            );
            console.log(
                "You may need to create fee structures for these programs manually."
            );
        }

        console.log("\nMigration completed successfully!");
    } catch (error) {
        console.error("Migration failed:", error);
        throw error;
    } finally {
        await client.close();
        console.log("Disconnected from MongoDB");
    }
}

// Run the migration
if (require.main === module) {
    migrateProgramFeeStructures()
        .then(() => {
            console.log("Migration script completed");
            process.exit(0);
        })
        .catch((error) => {
            console.error("Migration script failed:", error);
            process.exit(1);
        });
}