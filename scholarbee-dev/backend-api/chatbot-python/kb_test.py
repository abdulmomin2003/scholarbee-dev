import asyncio
import kb_tools

QUERIES = [
    "how do I pay the application fee",
    "what is CGPA",
    "scholarship documents needed",
    "forgot password",
    "can I apply to more than one university",
]

async def main():
    for q in QUERIES:
        print(f"\n=== {q} ===")
        result = await kb_tools.search_help_articles(query=q)
        print("count:", result["count"])
        print("summary:", result["summary"])
        for r in result["results"]:
            print("  -", r.get("title"))

asyncio.run(main())