import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import * as Animatable from 'react-native-animatable';
import { validateEmail, validatePhoneNumber } from '../../utils/validations';

const { width, height } = Dimensions.get('window');

const SignUp = ({ handleAuthentication, toggleForm }) => {
  const [email, setEmailLocal] = useState('');
  const [password, setPasswordLocal] = useState('');
  const [confirmPassword, setConfirmPasswordLocal] = useState('');
  const [name, setNameLocal] = useState('');
  const [phoneNumber, setPhoneNumberLocal] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const handleSignUp = () => {
    if (!name) {
      Alert.alert('Validation Error', 'Name cannot be blank.');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Validation Error', 'Please enter a valid email address.');
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      Alert.alert('Validation Error', 'Please enter a valid phone number.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Validation Error', 'Passwords do not match.');
      return;
    }

    handleAuthentication(false, email, password, name, phoneNumber);  // Indicate that this is a sign-up attempt
  };

  return (
    <Animatable.View animation="fadeInUp" style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>
      <Animatable.View animation="bounceIn" style={styles.inputContainer}>
        <Icon name="user" size={20} color="#000" style={styles.icon} />
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setNameLocal}
          placeholder="Name"
          autoCapitalize="words"
          placeholderTextColor="#A9A9A9"
        />
      </Animatable.View>
      <Animatable.View animation="bounceIn" delay={100} style={styles.inputContainer}>
        <Icon name="envelope" size={18} color="#000" style={styles.icon} />
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmailLocal}
          placeholder="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          placeholderTextColor="#A9A9A9"
        />
      </Animatable.View>
      <Animatable.View animation="bounceIn" delay={200} style={styles.inputContainer}>
        <Icon name="phone" size={20} color="#000" style={styles.icon} />
        <TextInput
          style={styles.input}
          value={phoneNumber}
          onChangeText={setPhoneNumberLocal}
          placeholder="Phone Number"
          keyboardType="phone-pad"
          placeholderTextColor="#A9A9A9"
        />
      </Animatable.View>
      <Animatable.View animation="bounceIn" delay={300} style={styles.inputContainer}>
        <Icon name="lock" size={20} color="#000" style={styles.icon} />
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPasswordLocal}
          placeholder="Password"
          secureTextEntry={!passwordVisible}
          placeholderTextColor="#A9A9A9"
        />
        <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
          <Icon name={passwordVisible ? "eye" : "eye-slash"} size={20} color="#000" style={styles.icon} />
        </TouchableOpacity>
      </Animatable.View>
      <Animatable.View animation="bounceIn" delay={400} style={styles.inputContainer}>
        <Icon name="lock" size={20} color="#000" style={styles.icon} />
        <TextInput
          style={styles.input}
          value={confirmPassword}
          onChangeText={setConfirmPasswordLocal}
          placeholder="Confirm Password"
          secureTextEntry={!confirmPasswordVisible}
          placeholderTextColor="#A9A9A9"
        />
        <TouchableOpacity onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)}>
          <Icon name={confirmPasswordVisible ? "eye" : "eye-slash"} size={20} color="#000" style={styles.icon} />
        </TouchableOpacity>
      </Animatable.View>
      <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
        <Animatable.Text animation="pulse" easing="ease-out" iterationCount="infinite" style={styles.signUpButtonText}>Sign Up</Animatable.Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={toggleForm}>
          <Text style={styles.signInText}>Already have an account?<Text style={styles.signIn2Text}> Sign In</Text></Text>
        </TouchableOpacity>
    </Animatable.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
    width: width,
    height: height,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '90%',
    height: 50,
    borderColor: '#000',
    borderWidth: 1,
    borderRadius: 10,
    paddingLeft: 15,
    marginBottom: 20,
    backgroundColor: '#FFF',
  },
  input: {
    flex: 1,
    color: '#000',
    fontSize: 16,
  },
  icon: {
    marginRight: 10,
  },
  signUpButton: {
    width: '90%',
    height: 50,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  signUpButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signInText: {
    marginTop: 20,
    marginBottom: 20,
    fontSize: 17,
  },
  signIn2Text: {
    color: '#007bff',
    marginTop: 20,
    marginBottom: 20,
    fontSize: 17,
    color: '#3498db',
  },
  orText: {
    color: '#333',
    marginBottom: 20,
    fontSize: 16,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '48%',
    height: 50,
    borderRadius: 25,
  },
  googleButton: {
    backgroundColor: '#db4437',
  },
  facebookButton: {
    backgroundColor: '#3b5998',
  },
  socialButtonText: {
    color: '#FFF',
    marginLeft: 10,
    fontSize: 16,
  },
});

export default SignUp;
