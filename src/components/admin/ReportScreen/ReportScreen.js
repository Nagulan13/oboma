// src/components/admin/ReportScreen/ReportScreen.js

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../services/firebaseConfig';
import { Picker } from '@react-native-picker/picker';
import ExcelJS from 'exceljs';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const ReportScreen = () => {
  const [orders, setOrders] = useState([]);
  const [report, setReport] = useState([]);
  const [reportType, setReportType] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filteredReport, setFilteredReport] = useState([]);

  // Fetch orders from Firestore
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'orders'));
        const ordersData = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          ordersData.push({ id: doc.id, ...data });
        });
        setOrders(ordersData);
      } catch (error) {
        console.error('Error fetching orders:', error);
        Alert.alert('Error', 'Failed to fetch orders.');
      }
    };

    fetchOrders();
  }, []);

  // Generate report grouped by type (e.g., Sales, Orders)
  const generateReport = () => {
    const monthlyReport = orders.reduce((acc, order) => {
      const orderDate = new Date(order.order_date);
      const month = orderDate.toLocaleString('default', { month: 'long' });
      const year = orderDate.getFullYear();
      const key = `${month} ${year}`;

      if (!acc[key]) {
        acc[key] = {
          totalSales: 0,
          totalOrders: 0,
          items: [],
        };
      }

      acc[key].totalSales += order.total_price;
      acc[key].totalOrders += 1;
      acc[key].items.push(order);

      return acc;
    }, {});

    setReport(Object.entries(monthlyReport));
    Alert.alert('Success', 'Report generated successfully.');
  };

  // Filter report by filter type
  const filterReport = () => {
    if (!reportType || !filterType) {
      Alert.alert('Error', 'Please select both report type and filter type.');
      return;
    }

    const filtered = report.filter(([key]) => {
      if (filterType === 'Month') {
        // Replace 'August' with dynamic month selection if implemented
        return key.includes('August');
      }
      if (filterType === 'Year') {
        // Replace '2023' with dynamic year selection if implemented
        return key.includes('2023');
      }
      // Extend with other filter types as needed
      return true;
    });

    setFilteredReport(filtered);
    Alert.alert('Success', 'Report filtered successfully.');
  };

  // Download filtered report as Excel
  const downloadReport = async () => {
    if (filteredReport.length === 0) {
      Alert.alert('Error', 'No data available to download.');
      return;
    }

    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Report');

      // Define columns
      worksheet.columns = [
        { header: 'Month', key: 'month', width: 20 },
        { header: 'Total Sales (RM)', key: 'totalSales', width: 20 },
        { header: 'Total Orders', key: 'totalOrders', width: 15 },
        // Dynamically add item columns if needed
      ];

      // Add rows
      filteredReport.forEach(([key, value]) => {
        worksheet.addRow({
          month: key,
          totalSales: value.totalSales.toFixed(2),
          totalOrders: value.totalOrders,
          // Add item details here if required
        });
      });

      // Generate Excel file as base64
      const buffer = await workbook.xlsx.writeBuffer();
      const base64 = Buffer.from(buffer).toString('base64');

      // Save to file
      const fileUri = FileSystem.documentDirectory + 'report.xlsx';
      await FileSystem.writeAsStringAsync(fileUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Share the file
      await Sharing.shareAsync(fileUri);
      Alert.alert('Success', 'Report downloaded successfully.');
    } catch (error) {
      console.error('Error writing Excel file:', error);
      Alert.alert('Error', 'Failed to save report.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Report Screen</Text>

      {/* Dropdown for report type */}
      <Text style={styles.label}>Select Report Type:</Text>
      <Picker
        selectedValue={reportType}
        onValueChange={(value) => setReportType(value)}
        style={styles.picker}
      >
        <Picker.Item label="Select Report Type" value="" />
        <Picker.Item label="Sales Report" value="sales" />
        <Picker.Item label="Order Report" value="orders" />
      </Picker>

      {/* Dropdown for filter type */}
      <Text style={styles.label}>Select Filter Type:</Text>
      <Picker
        selectedValue={filterType}
        onValueChange={(value) => setFilterType(value)}
        style={styles.picker}
      >
        <Picker.Item label="Select Filter Type" value="" />
        <Picker.Item label="Month" value="Month" />
        <Picker.Item label="Year" value="Year" />
        {/* Add more filter types as needed */}
      </Picker>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={generateReport}>
          <Text style={styles.buttonText}>Generate Report</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={filterReport}>
          <Text style={styles.buttonText}>Filter Report</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={downloadReport}>
          <Text style={styles.buttonText}>Download Report</Text>
        </TouchableOpacity>
      </View>

      {/* Display Filtered Report in a Table */}
      {filteredReport.length > 0 && (
        <ScrollView horizontal>
          <View>
            {/* Table Header */}
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.tableCell, styles.headerCell]}>Month</Text>
              <Text style={[styles.tableCell, styles.headerCell]}>
                Total Sales (RM)
              </Text>
              <Text style={[styles.tableCell, styles.headerCell]}>
                Total Orders
              </Text>
            </View>

            {/* Table Rows */}
            {filteredReport.map(([key, value]) => (
              <View key={key} style={styles.tableRow}>
                <Text style={styles.tableCell}>{key}</Text>
                <Text style={styles.tableCell}>
                  {value.totalSales.toFixed(2)}
                </Text>
                <Text style={styles.tableCell}>{value.totalOrders}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  header: {
    fontSize: 20, // Slightly increased font size for better visibility
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  label: {
    fontSize: 16, // Increased font size for better readability
    marginBottom: 8,
    color: '#555',
  },
  picker: {
    height: 50, // Adjusted height for better touch targets
    marginBottom: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 10, // Increased padding for better touch targets
    paddingHorizontal: 15, // Increased padding for better touch targets
    borderRadius: 8,
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16, // Increased font size for better readability
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#ddd',
    paddingVertical: 10, // Increased padding for better spacing
    paddingHorizontal: 5,
  },
  tableCell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14, // Increased font size for better readability
    color: '#333',
  },
  tableHeader: {
    backgroundColor: '#f1f1f1',
  },
  headerCell: {
    fontWeight: 'bold',
    fontSize: 14, // Increased font size for better readability
  },
});

export default ReportScreen;
