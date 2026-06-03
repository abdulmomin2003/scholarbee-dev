'use client';
import React, { useState } from 'react';
import { Tabs, Tab, Box, Typography, IconButton } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { COLORS } from '@/constants/colors';

interface TabData {
  key: string;
  id: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
}

interface RichTextChild {
  text?: string;
  bold?: boolean;
  children?: RichTextChild[];
  type?: 'li' | 'ul' | 'ol';
}

const TAB_DATA = [
  {
    key: 'Introduction',
    id: 'Step 1: Introduction',
    value:
      'The Bachelors of computer science program offer students the opportunity to integrate their interests in technology fields with this degree program.'
  },
  {
    key: 'Program Structure',
    id: 'Step 2: Program Structure',
    value: 'Detailed description of the program structure.'
  },
  {
    key: 'Curriculum',
    id: 'Step 3: Curriculum',
    value: 'Overview of the curriculum.'
  }
];

const RichTextContent = ({ content }: { content: RichTextChild[] }) => {
  const renderContent = (items: RichTextChild[]) => {
    return items?.map((item, index) => {
      if (item.type === 'ul') {
        return <ul key={index}>{renderContent(item.children || [])}</ul>;
      }
      if (item.type === 'ol') {
        return <ol key={index}>{renderContent(item.children || [])}</ol>;
      }
      if (item.type === 'li') {
        const hasNestedLi = item.children?.some((child) => child.type === 'li');

        if (hasNestedLi) {
          const directContent =
            item.children?.filter((child) => child.type !== 'li') || [];
          const liElements =
            item.children?.filter((child) => child.type === 'li') || [];

          return (
            <li key={index}>
              {renderContent(directContent)}
              {liElements.length > 0 && <ul>{renderContent(liElements)}</ul>}
            </li>
          );
        }

        return <li key={index}>{renderContent(item.children || [])}</li>;
      }
      if (item.children) {
        return <div key={index}>{renderContent(item.children)}</div>;
      }
      return item.bold ? (
        <strong key={index}>{item.text}</strong>
      ) : (
        <span key={index}>{item.text}</span>
      );
    });
  };

  return <div>{renderContent(content)}</div>;
};

const CustomTabs = ({
  tabsData = TAB_DATA,
  isRichText
}: {
  tabsData?: TabData[];
  isRichText?: boolean;
}) => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [isExpanded, setIsExpanded] = useState(true);
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <Box sx={styles.root}>
      <Box sx={styles.tabsContainer}>
        {tabsData.length ? (
          <>
            <Box
              borderRadius={2}
              sx={{ overflow: 'hidden' }}
              p={1}
              bgcolor="#f0f0f0"
            >
              <Tabs
                value={selectedTab}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                TabIndicatorProps={{ style: { display: 'none' } }}
              >
                {tabsData?.map((tab, index) => {
                  return (
                    <Tab
                      key={tab.id}
                      label={
                        tab.key.trim().endsWith(':')
                          ? tab.key.trim().slice(0, -1)
                          : tab.key
                      }
                      sx={
                        selectedTab === index ? styles.selectedTab : styles.tab
                      }
                    />
                  );
                })}
              </Tabs>
            </Box>
            <IconButton onClick={toggleExpand}>
              {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </>
        ) : (
          <Typography variant="body1">no data found</Typography>
        )}
      </Box>
      {isExpanded && (
        <Box p={2} sx={styles.tabContent}>
          {/* <Typography variant="h6" fontWeight="bold">
            {tabsData[selectedTab]?.key}
          </Typography> */}
          {isRichText ? (
            <RichTextContent content={tabsData[selectedTab]?.value} />
          ) : (
            <Typography variant="body1">
              {tabsData[selectedTab]?.value}
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
};

export default CustomTabs;

const styles = {
  root: {
    backgroundColor: COLORS.bgColor,
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    mb: 4
  },
  tabsContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    p: 1
  },
  tab: {
    textTransform: 'none',
    fontWeight: 'bold',
    color: '#8d8d8d',
    '&.Mui-selected': {
      color: '#004ae0',
      backgroundColor: '#ffffff',
      borderRadius: '4px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    }
  },
  selectedTab: {
    textTransform: 'none',
    fontWeight: 'bold',
    color: '#004ae0',
    backgroundColor: '#ffffff',
    borderRadius: '4px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  },
  tabContent: {
    borderRadius: '8px',
    mt: 2
  }
};
