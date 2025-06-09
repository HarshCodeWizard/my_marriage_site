import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, TextField, Button, List, ListItem, ListItemText } from '@mui/material';
import axios from 'axios';

const SearchDialog = ({ open, onClose, onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = async () => {
    try {
      // Fetch caterers and decorators from the API
      const [caterersResponse, decoratorsResponse] = await Promise.all([
        axios.get('http://localhost:8000/api/caterers'),
        axios.get('http://localhost:8000/api/decorators'),
      ]);

      const caterers = caterersResponse.data;
      const decorators = decoratorsResponse.data;

      // Combine and filter results based on search term
      const allItems = [...caterers, ...decorators];
      const results = allItems.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase()))
      );

      setSearchResults(results);
      onSearch(results); // Pass results to parent for further handling (e.g., navigation)
    } catch (error) {
      console.error('Error fetching search results:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Search Lovelockedn</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Search for Caterers or Decorators"
          type="text"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <Button onClick={handleSearch} variant="contained" color="primary" style={{ marginTop: '10px' }}>
          Search
        </Button>

        {searchResults.length > 0 && (
          <List>
            {searchResults.map((result) => (
              <ListItem
                button
                key={result._id}
                onClick={() => {
                  window.location.href = `/caterers/${result._id}` || `/decorators/${result._id}`;
                  onClose();
                }}
              >
                <ListItemText
                  primary={result.name}
                  secondary={`${result.title} - ${result.category}`}
                />
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SearchDialog;