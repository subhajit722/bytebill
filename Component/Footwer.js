import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Modal, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation
import { Picker } from '@react-native-picker/picker';
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('bills.db');

const Footer = () => {
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false); // State to manage modal visibility
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemCode, setItemCode] = useState('');
  const [itemCategory, setItemCategory] = useState('Food');
  const [sellingPrice, setSellingPrice] = useState('');
  const [gst, setGst] = useState('');

  useEffect(() => {
    createTable();
  }, []);

  // Function to create the itemss table if it doesn't exist
  const createTable = async () => {
    await db.execAsync(
    
        'CREATE TABLE IF NOT EXISTS itemss (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, price INTEGER, code INTEGER, category TEXT, sellingPrice INTEGER, gst INTEGER );',
        [],
        );
  };

  const handleAddItem = async () => {
    try {
      await db.runAsync(
        'INSERT INTO itemss (name, price, code, category, sellingPrice, gst) VALUES (?, ?, ?, ?, ?, ?);',
        [itemName, parseFloat(itemPrice), itemCode, itemCategory, parseFloat(sellingPrice), parseFloat(gst)]
      );

      setItemName('');
      setItemPrice('');
      setItemCode('');
      setItemCategory('Food');
      setSellingPrice('');
      setGst('');
      setModalVisible(false);

      Alert.alert('Success', 'Item saved successfully!');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to save item.');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.iconContainer}
        onPress={() => navigation.navigate('Main')}>
        <Ionicons name="home" size={25} color="white" />
        <Text style={styles.iconText}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.iconContainer}
        onPress={() => setModalVisible(true)}>
        <Ionicons name="add-circle" size={25} color="white" />
        <Text style={styles.iconText}>Add</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.iconContainer}
        onPress={() => navigation.navigate('Item')}>
        <Ionicons name="cube" size={25} color="white" />
        <Text style={styles.iconText}>Items</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.iconContainer}
        onPress={() => navigation.navigate('Dashboard')}>
        <Ionicons name="speedometer" size={25} color="white" />
        <Text style={styles.iconText}>Dashboard</Text>
      </TouchableOpacity>

      {/* Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Add Item</Text>
            {/* Your input fields and buttons */}
            {/* For example: */}
            <TextInput
              style={styles.input}
              placeholder="Item Name"
              value={itemName}
              onChangeText={(text) => setItemName(text)}
            />
            <TextInput
              style={styles.input}
              placeholder="Price"
              value={itemPrice}
              onChangeText={(text) => setItemPrice(text)}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Item Code"
              value={itemCode}
              keyboardType="numeric"
              onChangeText={(text) => setItemCode(text)}
            />
            <Picker
              selectedValue={itemCategory}
              style={styles.picker}
              onValueChange={(itemValue, itemIndex) =>
                setItemCategory(itemValue)
              }>
              <Picker.Item label="Food" value="Food" />
              <Picker.Item label="Clothing" value="Clothing" />
              <Picker.Item label="Electronics" value="Electronics" />
              <Picker.Item label="Others" value="Others" />
            </Picker>
            <TextInput
              style={styles.input}
              placeholder="Selling Price"
              value={sellingPrice}
              onChangeText={(text) => setSellingPrice(text)}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="GST"
              value={gst}
              onChangeText={(text) => setGst(text)}
            />
            <TouchableOpacity style={styles.saveButton} onPress={handleAddItem}>
              <Text style={styles.textStyle}>Save</Text>
            </TouchableOpacity>
            {/* End of example */}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'black',
    paddingBottom: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    color: 'white',
  },
  iconContainer: {
    alignItems: 'center',
    color: 'white',
  },
  iconText: {
    fontSize: 12,
    marginTop: 5,
    color: 'white',
  },
  picker: {
    height: 50, // Adjust height as needed
    width: '100%', // Adjust width as needed
    backgroundColor: '#ffffff', // Adjust background color as needed
    borderWidth: 1, // Add border styles if needed
    borderColor: '#ccc', // Adjust border color as needed
    borderRadius: 5, // Adjust border radius as needed
    marginBottom: 10, // Adjust margin as needed
    paddingHorizontal: 10, // Adjust padding as needed
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    width: '80%',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    width: '100%',
  },
  saveButton: {
    backgroundColor: 'black',
    padding: 10,
    borderRadius: 5,
    elevation: 2,
    marginTop: 10,
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default Footer;
