import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { useNavigation } from '@react-navigation/native';
import Navbar from './Navbar';
import Footer from './Footwer';
const db = SQLite.openDatabaseSync('bills.db');

const DashboardScreen = () => {
  const navigation = useNavigation();
  const [billIds, setBillIds] = useState([]);

  useEffect(() => {
    fetchBillIds();
  }, []);

  // Function to fetch unique bill IDs
  const fetchBillIds = async () => {
    try {
      const result = await db.getAllAsync('SELECT DISTINCT billId FROM newbilsss', []);
      console.log(result);
      // Update the key to match the one in the result object
      setBillIds(result.map((item) => item.billid)); 
    } catch (error) {
      console.error('Error fetching bill IDs:', error);
    }
  };
  

  // Function to handle bill ID click
  const handleBillIdClick = (billId) => {
    navigation.navigate('BillScreen', { billId });
  };

  // Render each bill ID as a list item
  const renderBillIdItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleBillIdClick(item)}>
      <Text style={styles.item}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <>
    <Navbar/>
   
    <View style={styles.container}>

      <Text style={styles.title}>Dashboard Screen</Text>
      <FlatList
        data={billIds}
        renderItem={renderBillIdItem}
        keyExtractor={(item) => item}
      />
    </View>
<Footer/>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  item: {
    fontSize: 18,
    marginBottom: 10,
  },
});

export default DashboardScreen;
