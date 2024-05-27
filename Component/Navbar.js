import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, Text, TouchableOpacity, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('bills.db');

const Navbar = ({ allSet, lop }) => {
  const [code, setCode] = useState();
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showBillModal, setShowBillModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [generatedBillId, setGeneratedBillId] = useState('');
  const [billName, setBillName] = useState('');
  const [quntimodle, setQuantityModel] = useState(false);
  const [quantity, setQuantity] = useState('');
  const [selectedResult, setSelectedResult] = useState(null);
  const [gst, setGst] = useState();

  useEffect(() => {
    // Create table if not exists
    createTable();
  }, []);

  const createTable = async () => {
    await db.execAsync(
      `CREATE TABLE IF NOT EXISTS newbilsss (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        itemname TEXT,
        itemcode TEXT,
        quantity INTEGER,
        price INTEGER,
        withoutgst INTEGER,
        totalpricewithgst INTEGER,
        billname TEXT,
        billid TEXT,
        gst INTEGER,
        createdate DATETIME
      );`
    );
  };

  const handleAddBill = async () => {
    try {
      console.log(code)
      // Check if a bill with the same billid already exists
      const existingBill = await db.getAllSync(
        `SELECT * FROM newbilsss WHERE itemcode = ?;`,
        [code]
      );

      if (existingBill.length > 1) {
        // If a bill with the same billid exists, show a message to the user
        console.log('A bill with the same bill ID already exists');
        return;
      }

      // If no existing bill found, proceed with adding the new bill
      const totalPriceWithoutGST = parseFloat(quantity) * selectedResult.price;

      // Calculate the GST amount
      const gstAmount = totalPriceWithoutGST * (selectedResult.gst / 100);

      // Calculate the total price including GST
      const totalPriceWithGST = totalPriceWithoutGST + gstAmount;

      const now = new Date().toISOString();
      await db.runAsync(
        `INSERT INTO newbilsss (itemname, itemcode, quantity, price, withoutgst, totalpricewithgst, billname, billid, createdate, gst) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [selectedResult.name, selectedResult.code, quantity, selectedResult.price, totalPriceWithoutGST, totalPriceWithGST, billName, generatedBillId, now, selectedResult.gst]
      );
      setShowSuccessModal(true);
      lop(); // Display success message modal
    } catch (error) {
      console.error('Error adding bill:', error);
    }
  };

  const handleSearch = async (text) => {
    setSearchText(text);
    filterData(text);
  };

  const filterData = async (text) => {
    if (!text) {
      setSearchResults([]);
      return;
    }

    try {
      const result = await db.getAllAsync(
        `SELECT * FROM itemss WHERE name LIKE ? OR code LIKE ?;`,
        [`%${text}%`, `%${text}%`]
      );
      setSearchResults(result);
    } catch (error) {
      console.error('Error filtering data:', error);
      setSearchResults([]);
    }
  };

  // Function to generate the bill ID
  const generateBillId = () => {
    // Generate a random 4-digit number
    const randomNumber = Math.floor(1000 + Math.random() * 9000);
  
    
    const newBillId = 'byt' + randomNumber;
  
   
    setGeneratedBillId(newBillId);
    setShowSuccessModal(true);
    allSet(newBillId, billName);
  };
  

  return (<>
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="storefront" size={24} color="#333" />
      </View>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={24} color="#333" style={styles.searchIcon} />
        <TextInput
          placeholder="Search..."
          value={searchText}
          onChangeText={handleSearch}
          style={styles.searchInput}
        />
      </View>
      
      {/* Bill generate icon */}
      <TouchableOpacity style={styles.billIconContainer} onPress={() => setShowBillModal(true)}>
        <Ionicons name="receipt" size={24} color="#333" />
      </TouchableOpacity>

      {/* Modal to prompt for bill name */}
      <Modal visible={showBillModal} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter Bill Name</Text>
            <TextInput
              placeholder="Bill Name"
              value={billName}
              onChangeText={setBillName}
              style={styles.input}
            />
            <TouchableOpacity style={styles.button} onPress={generateBillId}>
              <Text style={styles.buttonText}>Generate Bill ID</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal to display success message */}
      <Modal visible={showSuccessModal} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Bill ID Generated Successfully</Text>
            <Text style={styles.modalText}>Generated Bill ID: {generatedBillId}</Text>
            <TouchableOpacity style={styles.button} onPress={() => {
              setShowSuccessModal(false);
              setShowBillModal(false);
            }}>
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal to enter quantity */}
      <Modal visible={quntimodle} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter Quantity</Text>
            <TextInput
              placeholder="Quantity"
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
              style={styles.input}
            />
            <TouchableOpacity style={styles.button} onPress={() => {
              setQuantityModel(false);
              if (generatedBillId && quantity && selectedResult) {
                handleAddBill();
              } else {
                console.log('Bill ID not generated or quantity not provided');
              }
            }}>
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
    {searchResults.length > 0 && (
        <FlatList
        style={styles.searchResultsBox}
          data={searchResults}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => {
              setSelectedResult(item);
              setQuantityModel(true);
              setCode(item.code);
            }}>
              <View style={styles.searchResultItem}>
                <Text>{item.name} - {item.code} _ {item.gst}</Text>
              </View>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id.toString()}
        />
      )}

    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#405DE6', // Instagram's primary color
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    height: 70,
  },
  iconContainer: {
    paddingHorizontal: 5,
  },
  searchContainer: {
   
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    backgroundColor: '#ffffff', // White background for search bar
    borderRadius: 8,
    marginHorizontal: 10, // Increased margin for spacing
    height: 40,
    paddingHorizontal: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
    color: '#000000', // Black text color
  },
  searchResultsBox: {
   
    backgroundColor: 'red', // White background for search results
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    height: '49px', // Adjusted max height to prevent overlap
    overflow: 'scroll',
   
  },
  searchResultItem: {
    marginBottom : 5,
    paddingVertical: 15,
    paddingHorizontal: 10, // Increased padding for spacing
    backgroundColor: '#FAFAFA', // Light grey background for search results
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
      backgroundColor: '#ffffff', // White background for modal content
      padding: 20,
      borderRadius: 10,
      alignItems: 'center',
    },
    modalTitle: {
      fontSize: 18,
      marginBottom: 20,
      color: '#000000', // Black text color
    },
    button: {
      backgroundColor: '#6C63FF', // Instagram's primary button color
      padding: 10,
      borderRadius: 5,
      width: '100%',
      alignItems: 'center',
      marginTop: 10,
    },
    buttonText: {
      color: '#ffffff', // White text color for buttons
      fontWeight: 'bold',
    },
    modalText: {
      marginBottom: 20,
      color: '#000000', // Black text color
    },
    input: {
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 5,
      padding: 10,
      marginBottom: 20,
      width: '100%',
      color: '#000000', // Black text color
    },
  });
  
  

export default Navbar;
