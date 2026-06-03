import { Box, Container, Stack, Typography } from '@mui/material';
import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
// import Navbar from '@/components/organisms/navbar';
// import Footer from '@/components/organisms/footer';
// import BreadCrumbs from '@/components/organisms/breadCrumbs';
import { COLORS } from '@/constants/colors';
import Title from '@/components/atoms/title';
import { TermsAndConditionsApi } from '@/endpoints/tAndC';
import { formattedDate } from '@/utils/helperFunctions';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://scholarbee.pk/terms-and-conditions'
  }
};

export const dynamic = 'force-dynamic';

interface TextNode {
  text: string;
  bold?: boolean;
}

interface ContentNode {
  type: string;
  children: TextNode[] | ContentNode[];
}

const GENERAL_TERMS_DOCUMENT_TYPE = 'general_terms_and_conditions';

const TermsAndConditionsPage = async () => {
  const tAndCApi = new TermsAndConditionsApi();

  const legalDocuments = await tAndCApi.listLegalDocuments({
    applicable_on: 'user_registration',
    status: 'active'
  });

  const termsListItem = legalDocuments.find(
    (doc) => doc.document_type === GENERAL_TERMS_DOCUMENT_TYPE
  );

  if (!termsListItem?._id) {
    notFound();
  }

  const generalTermsAndConditions = await tAndCApi.getLegalDocument(
    termsListItem._id
  );

  const renderInlineTexts = (texts: TextNode[]) =>
    texts?.map((text, index) =>
      text.bold ? (
        <strong key={index}>{text.text}</strong>
      ) : (
        <span key={index}>{text.text}</span>
      )
    );

  const renderElement = (item: ContentNode, index: number) => {
    if (item.type === 'h2') {
      return (
        <Typography key={index} variant="h4">
          {renderInlineTexts(item.children as TextNode[])}
        </Typography>
      );
    } else if (item.type === 'h3') {
      return (
        <Typography key={index} variant="h5">
          {renderInlineTexts(item.children as TextNode[])}
        </Typography>
      );
    } else if (item.type === 'ul') {
      return (
        <ul key={index}>
          {(item.children as ContentNode[]).map((li, liIndex) => (
            <li key={liIndex}>
              {renderInlineTexts(li.children as TextNode[])}
            </li>
          ))}
        </ul>
      );
    } else {
      // Assume it's a paragraph
      return (
        <Typography key={index} paragraph>
          {renderInlineTexts(item.children as TextNode[])}
        </Typography>
      );
    }
  };

  // Parse content if it's a string, otherwise use as is
  const content =
    typeof generalTermsAndConditions.content === 'string'
      ? JSON.parse(generalTermsAndConditions.content || '[]')
      : generalTermsAndConditions.content || [];

  return (
    <Box>
      {/* <Navbar isCritical={false} />
      <Container sx={{ pb: 1 }}>
        <BreadCrumbs />
      </Container> */}
      <Box bgcolor={COLORS.bgColor}>
        <Container sx={{ py: 6 }}>
          <Stack
            bgcolor={COLORS.bgBlue}
            direction={'row'}
            justifyContent={'space-between'}
            alignItems={'center'}
            px={5}
            py={7}
            // mt={6}
          >
            <Title title="Terms & Conditions" />
            <Typography fontSize={22}>
              Last Updated:{' '}
              {formattedDate(generalTermsAndConditions?.updatedAt || '')}
            </Typography>
          </Stack>
          <Box sx={{ mt: 4 }}>
            {Array.isArray(content) &&
              content.map((item: ContentNode, index: number) =>
                renderElement(item, index)
              )}
          </Box>
        </Container>
        {/* <Footer /> */}
      </Box>
    </Box>
  );
};

export default TermsAndConditionsPage;
