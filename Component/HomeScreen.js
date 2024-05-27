import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, ScrollView } from 'react-native';
import Footwer from './Footwer';
import Navbar from './Navbar';
import * as SQLite from 'expo-sqlite';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import { shareAsync } from 'expo-sharing';

const db = SQLite.openDatabaseSync('bills.db');

const HomeScreen = () => {
  const [billId, setBillId] = useState('');
  const [lop, setLop] = useState(false);
  const [billName, setBillName] = useState('');
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [editPrice, setEditPrice] = useState('');
  const [did, setDid] = useState();
  const [editGst, setEditGst] = useState();
  const [editQuantity, setEditQuantity] = useState('');

  useEffect(() => {
    if (billId) {
      fetchBillItems();
    }
  }, [billId, lop]);

  useEffect(() => {
    fetchBillItems();
  }, []);

  const fetchBillItems = async () => {
    console.log(billId)
    try {
      const result = await db.getAllAsync(
        `SELECT * FROM newbilsss WHERE billid = ?;`,
        [billId]
      );
      if (result.length > 0) {
        setBillName(result[0].billname);
        setItems(result);
      }
    } catch (error) {
      console.error('Error fetching bill items:', error);
    }
  };

  const allSet = (id, name) => {
    setBillId(id);
    setBillName(name);
  };

  const handleEditItem = (item) => {
    setSelectedItem(item);
    setEditPrice(item.price);
    setEditGst(item.gst);
    setEditQuantity(item.quantity);
    setEditModalVisible(true);
  };

  const handleDeleteItem = async () => {
    try {
      await db.runAsync(
        `DELETE FROM newbilsss WHERE id = ?;`,
        [did]
      );
      setDeleteModalVisible(false);
      fetchBillItems();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleUpdateItem = async () => {
    const totalPriceWithoutGST = editQuantity * editPrice;
    const gstAmount = totalPriceWithoutGST * (editGst / 100);
    const totalPriceWithGST = totalPriceWithoutGST + gstAmount;

    try {
      await db.runAsync(
        `UPDATE newbilsss SET totalpricewithgst = ?, withoutgst = ?, quantity = ? WHERE id = ?;`,
        [totalPriceWithGST, totalPriceWithoutGST, editQuantity, selectedItem.id]
      );
      setEditModalVisible(false);
      fetchBillItems();
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const handlePrint = async () => {
    const htmlContent = `
      <html>
        <head>
          <title>Bill Details</title>
          <style>
            body { font-family: Arial, sans-serif; }
            h1 { color: #333; }
            p { color: #666; }
            .he {
              width: 100%;
              display: flex;
              flex-direction: row;
              justify-content: space-around;
              background-color: aqua;
            }
            .h {
              text-align: center;
              width: 100%;
              display: flex;
              align-items: center;
            }
            .box {
              width: 100%;
            }
            .boxmain {
              width: 100%;
              display: flex;
              flex-direction: row;
              justify-content: space-around;
            }
          </style>
        </head>
        <body>
          <h1>Bill Details</h1>
          <div class='he'>
            <div>
              <p>Bill ID: ${billId}</p>
              <p> Date and Time : ${new Date().toISOString()}</p>
            </div>
            <p>Bill Name: ${billName}</p>
          </div>
          <div class='box'>
            <h2 class='h'>Items:</h2>
            ${items.map(
              (item) => `
                <div class='boxmain' key=${item.id}>
                  <div>
                    <p>Item Name: ${item.itemname}</p>
                    <p>Item Code: ${item.itemcode}</p>
                    <p>Quantity: ${item.quantity}</p>
                  </div>
                  <div>
                    <p>Price: ${item.price}</p>
                    <p>Price Without GST: ${item.withoutgst}</p>
                    <p>Total Price: ${item.totalpricewithgst}</p>
                  </div>
                </div>
              `
            )}
          </div>
        </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html: htmlContent, base64: false });
      console.log('Printed successfully:', uri);
      await shareAsync(uri);
    } catch (error) {
      console.error('Error printing:', error);
    }
  };

  return (
    <>
      <View style={styles.container}>
        <Navbar allSet={allSet} lop={() => setLop(!lop)} />
        <ScrollView>
          <View style={styles.header}>
            <Text style={styles.headerText}>Bill ID: {billId}</Text>
            <Text style={styles.headerText}>Bill Name: {billName}</Text>
          </View>
          <View style={styles.itemList}>
            <Text style={styles.itemListTitle}>Items:</Text>
            {items.reverse().map((item) => (
              <View key={item.id} style={styles.item}>
                <Text>{item.itemname}</Text>
                <Text>Code: {item.itemcode}</Text>
                <Text>Quantity: {item.quantity}</Text>
                <Text>Price: {item.price}</Text>
                <Text>Price With Out GST: {item.withoutgst}</Text>
                <Text>Total Price: {item.totalpricewithgst}</Text>
                <View style={styles.actions}>
                  <TouchableOpacity onPress={() => handleEditItem(item)}>
                    <Ionicons name="create-outline" size={24} color="blue" style={styles.actionIcon} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => { setDeleteModalVisible(true), setDid(item.id) }}>
                    <Ionicons name="trash-outline" size={24} color="red" style={styles.actionIcon} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
        <TouchableOpacity onPress={handlePrint}>
          <View style={styles.printButton}>
            <Text style={{ color: 'white', fontWeight: 'bold' }}>Print</Text>
          </View>
        </TouchableOpacity>
      </View>
      <Footwer />
      <Modal visible={editModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Item</Text>
            <TextInput
              placeholder="Quantity"
              value={editQuantity}
              onChangeText={setEditQuantity}
              keyboardType="numeric"
              style={styles.input}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.button} onPress={() => setEditModalVisible(false)}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={handleUpdateItem}>
                <Text style={styles.buttonText}>Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal visible={deleteModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Delete Item?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.button} onPress={() => setDeleteModalVisible(false)}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, { backgroundColor: 'red' }]} onPress={handleDeleteItem}>
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  headerText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemList: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  itemListTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  item: {
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  actionIcon: {
    marginRight: 10,
  },
  printButton: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    margin: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  button: {
    marginLeft: 10,
    padding: 10,
    borderRadius: 5,
    backgroundColor: 'blue',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default HomeScreen;
