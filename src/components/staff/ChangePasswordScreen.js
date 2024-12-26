import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Animated, Easing } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getAuth, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { validatePassword } from '../../utils/validations';

const ChangePasswordScreen = ({ navigation }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [secureTextEntryCurrent, setSecureTextEntryCurrent] = useState(true);
  const [secureTextEntryNew, setSecureTextEntryNew] = useState(true);
  const [secureTextEntryConfirm, setSecureTextEntryConfirm] = useState(true);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, []);

  const handleChangePassword = async () => {
    if (!validatePassword(newPassword) || !validatePassword(confirmPassword)) {
      Alert.alert('Invalid input', 'Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);

      try {
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, newPassword);
        Alert.alert('Success', 'Password changed successfully');
        navigation.goBack();
      } catch (error) {
        console.error('Failed to change password:', error);
        Alert.alert('Failed to change password', `Firebase: ${error.message}`);
      }
    } else {
      Alert.alert('No user is currently signed in.');
    }
  };

  const renderPasswordField = (label, value, setValue, secureTextEntry, setSecureTextEntry) => (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.detailContainer}>
        <Icon name="lock" size={24} style={styles.icon} />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={setValue}
          secureTextEntry={secureTextEntry}
          placeholder={label}
          placeholderTextColor="#A9A9A9"
        />
        <TouchableOpacity onPress={() => setSecureTextEntry(!secureTextEntry)} style={styles.iconWrapper}>
          <Icon name={secureTextEntry ? "visibility-off" : "visibility"} size={24} color="#888" />
        </TouchableOpacity>
      </View>
      <View style={styles.separator} />
    </View>
  );

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Text style={styles.header}>Change Password</Text>
      {renderPasswordField('Current Password', currentPassword, setCurrentPassword, secureTextEntryCurrent, setSecureTextEntryCurrent)}
      {renderPasswordField('New Password', newPassword, setNewPassword, secureTextEntryNew, setSecureTextEntryNew)}
      {renderPasswordField('Confirm Password', confirmPassword, setConfirmPassword, secureTextEntryConfirm, setSecureTextEntryConfirm)}
      <TouchableOpacity style={styles.saveButton} onPress={handleChangePassword}>
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 40,
    backgroundColor: '#f8f9fa',
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#343a40',
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 5,
  },
  detailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  icon: {
    marginRight: 10,
    color: '#495057',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#343a40',
  },
  iconWrapper: {
    padding: 10,
  },
  separator: {
    height: 1,
    backgroundColor: '#e9ecef',
    marginTop: 5,
  },
  saveButton: {
    marginTop: 20,
    backgroundColor: '#007bff',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 2,
  },
  saveButtonText: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '600',
  },
});

export default ChangePasswordScreen;
