import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress
} from '@mui/material';
import { styles } from '../styles';
import { SidebarItem } from '../types';
import Image from 'next/image';

const Sidebar = ({ items }: { items: SidebarItem[] }) => (
  <Box sx={styles.sidebar}>
    <List>
      {items.map((item, index) => {
        const isLoading = item?.isLoading;

        return (
          <ListItem
            key={index}
            sx={{
              ...(item.active ? styles.activeListItem : styles.listItem),
              ...(isLoading && {
                opacity: 0.7,
                pointerEvents: 'none'
              })
            }}
            onClick={isLoading ? undefined : item.onClick}
            style={{ cursor: isLoading ? 'not-allowed' : 'pointer' }}
          >
            <ListItemIcon sx={item.active ? styles.activeIcon : styles.icon}>
              {isLoading ? (
                <CircularProgress
                  size={24}
                  sx={{
                    color: item.active ? 'white' : '#004ae0'
                  }}
                />
              ) : (
                <Image src={item.icon} alt={item.text} width={24} height={24} />
              )}
            </ListItemIcon>
            <ListItemText
              primary={item.text}
              sx={item.active ? styles.activeText : styles.listItemText}
            />
          </ListItem>
        );
      })}
    </List>
  </Box>
);

export default Sidebar;
