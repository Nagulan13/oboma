import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Animated, Easing, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const SettingsScreen = ({ route, navigation }) => {
  const { handleSignOut } = route.params;
  const [fadeAnim] = React.useState(new Animated.Value(0));
  const [scaleAnim] = React.useState(new Animated.Value(0.95));
  const [translateAnim] = React.useState(new Animated.Value(-100));

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();

    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 100,
      useNativeDriver: true,
    }).start();

    Animated.timing(translateAnim, {
      toValue: 0,
      duration: 700,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();
  }, []);

  const handleLogout = () => {
    Alert.alert(
      "Do you want to exit?",
      "",
      [
        { text: "No", style: "cancel" },
        { text: "Yes", onPress: handleSignOut }
      ],
      { cancelable: false }
    );
  };

  const renderButton = (title, iconName, onPress) => (
    <Animated.View style={[styles.buttonWrapper, { transform: [{ scale: scaleAnim }, { translateY: translateAnim }] }]} key={title}>
      <TouchableOpacity style={styles.button} onPress={onPress}>
        <Icon name={iconName} size={24} style={styles.icon} />
        <Text style={styles.buttonText}>{title}</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <Text style={styles.header}>Settings</Text>
        {renderButton("Personal Details", "person", () => navigation.navigate('PersonalDetails'))}
        {renderButton("Change Password", "lock", () => navigation.navigate('ChangePassword'))}
        {renderButton("Logout", "exit-to-app", handleLogout)}
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  scrollView: {
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 40,
    textAlign: 'center',
    color: '#333',
  },
  buttonWrapper: {
    width: '100%',
    marginVertical: 10,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    padding: 15,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  icon: {
    marginRight: 15,
    color: '#888',
  },
});

export default SettingsScreen;
