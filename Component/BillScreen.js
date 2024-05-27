import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import * as SQLite from 'expo-sqlite';
import Navbar from './Navbar';
import Footer from './Footwer';
const db = SQLite.openDatabaseSync('bills.db');

const BillScreen = ({ route }) => {
  const { billId } = route.params;
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchItemsForBill(billId);
  }, [billId]);

  const fetchItemsForBill = async (billId) => {
    try {
      const result = await db.getAllAsync(
        'SELECT * FROM newbilsss WHERE billid = ?',
        [billId]
      );
      setItems(result);
    } catch (error) {
      console.error('Error fetching items for bill:', error);
    }
  };

  return (
    <>
    <Navbar/>

    <View style={styles.container}>
      <Text style={styles.title}>Bill ID: {billId}</Text>
      {/* <Text style={styles.title}>Bill NAME:{items[0].billname}</Text> */}
      <FlatList
        data={items}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text>Name: {item.itemname}</Text>
            <Text>Code: {item.itemcode}</Text>
            <Text>Price: {item.price}</Text>
            <Text>Price  GST: {item.totalpricewithgst}</Text>

            <Text>Quantity: {item.quantity}</Text>
            <Text>DateTime: {item.createdate}</Text>
            {/* Add more fields as needed */}
          </View>
        )}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
    <Footer/>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  item: {
    backgroundColor: '#f9c2ff',
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 10,
  },
});

export default BillScreen;
