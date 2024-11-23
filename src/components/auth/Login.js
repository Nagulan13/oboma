import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import * as Animatable from 'react-native-animatable';
import { validateEmail } from '../../utils/validations';

const { width, height } = Dimensions.get('window');

const Login = ({ handleAuthentication, toggleForm, navigateToPasswordReset }) => {
  const [email, setEmailLocal] = useState('');
  const [password, setPasswordLocal] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    if (!email) {
      Alert.alert('Validation Error', 'Email cannot be blank.');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Validation Error', 'Please enter a valid email address.');
      return;
    }

    if (!password) {
      Alert.alert('Validation Error', 'Password cannot be blank.');
      return;
    }
    handleAuthentication(true, email, password); // Indicate that this is a login attempt
  };

  return (
    <Animatable.View animation="fadeInUp" style={styles.container}>
      <Animatable.Image 
        animation="pulse" 
        source={require('../../../assets/image/logo.png')} 
        style={styles.logo} 
        iterationCount="infinite" 
        direction="alternate"
        duration={3000}
      />
      <Animatable.Text animation="fadeIn" delay={100} style={styles.title}>Login to Your Account</Animatable.Text>
      <Animatable.Text animation="fadeIn" delay={200} style={styles.slogan}>~ Welcome To OTAi Burger ~</Animatable.Text>
      <Animatable.View animation="fadeIn" delay={300} style={styles.inputContainer}>
        <Icon name="envelope" size={18} color="#000" style={styles.icon} /> 
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmailLocal}
          placeholder="email address"
          keyboardType="email-address"
          placeholderTextColor="#A9A9A9"
        />
      </Animatable.View>
      <Animatable.View animation="fadeIn" delay={400} style={styles.inputContainer}>
        <Icon name="lock" size={22} color="#000" style={styles.icon} />
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPasswordLocal}
          placeholder="password"
          secureTextEntry={!showPassword}
          placeholderTextColor="#A9A9A9"
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Icon name={showPassword ? "eye-slash" : "eye"} size={20} color="#000" style={styles.icon} />
        </TouchableOpacity>
      </Animatable.View>
      <View style={styles.optionsContainer}>
        <TouchableOpacity onPress={navigateToPasswordReset}>
          <Text style={styles.forgotPassword}>Forgot Password?</Text>
        </TouchableOpacity>
      </View>
      <Animatable.View animation="fadeIn" delay={500} style={styles.loginButtonContainer}>
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Animatable.Text animation="pulse" easing="ease-out" iterationCount="infinite" style={styles.loginButtonText}>Login</Animatable.Text>
        </TouchableOpacity>
      </Animatable.View>
      <Animatable.View animation="fadeIn" delay={800}>
        <TouchableOpacity onPress={toggleForm}>
          <Text style={styles.signUpText}>Don't have an account?<Text style={styles.signUp2Text}> Sign up</Text></Text>
        </TouchableOpacity>
      </Animatable.View>
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
  logo: {
    width: 260,
    height: 150,
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 15,
  },
  slogan: {
    fontSize: 16,
    color: '#A9A9A9',
    marginBottom: 30,
    textAlign: 'center',
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
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#000',
    fontSize: 16,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: '90%',
    marginBottom: 20,
  },
  forgotPassword: {
    color: '#3498db',
  },
  loginButtonContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  loginButton: {
    width: '90%',
    height: 50,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#000',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  loginButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  orText: {
    fontSize: 16,
    color: '#000',
    marginVertical: 20,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    marginBottom: 20,
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
  signUpText: {
    color: '#000',
    marginTop: 20,
    fontSize: 17,
  },
  signUp2Text: {
    color: '#000',
    marginTop: 20,
    fontSize: 17,
    color: '#3498db',
  },
});

export default Login;
