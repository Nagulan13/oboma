import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from '../components/auth/Login';
import SignUp from '../components/auth/SignUp';
import PasswordReset from '../components/auth/PasswordReset';
import AdminHome from '../components/admin/AdminHome';
import StaffHome from '../components/staff/StaffHome';
import CustomerHome from '../components/customer/CustomerHome';
import SettingsScreen from '../components/shared/SettingsScreen';
import PersonalDetailsScreen from '../components/shared/PersonalDetailsScreen';
import ChangePasswordScreen from '../components/shared/ChangePasswordScreen';
import UpdatePersonalDetailsScreen from '../components/shared/UpdatePersonalDetailsScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = ({ user, userType, handleSignOut }) => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    {user ? (
      <>
        <Stack.Screen name="Home">
          {props => {
            switch (userType) {
              case 'admin':
                return <AdminHome {...props} handleSignOut={() => handleSignOut(props.navigation)} />;
              case 'staff':
                return <StaffHome {...props} handleSignOut={() => handleSignOut(props.navigation)} />;
              case 'customer':
                return <CustomerHome {...props} handleSignOut={() => handleSignOut(props.navigation)} />;
              default:
                return null;
            }
          }}
        </Stack.Screen>
        <Stack.Screen name="Settings" component={SettingsScreen} initialParams={{ handleSignOut }} />
        <Stack.Screen name="PersonalDetails" component={PersonalDetailsScreen} />
        <Stack.Screen name="UpdatePersonalDetails" component={UpdatePersonalDetailsScreen} />
        <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      </>
    ) : (
      <>
        <Stack.Screen name="Login" options={{ headerShown: false }}>
          {props => (
            <Login
              {...props}
              handleAuthentication={handleAuthentication}
              toggleForm={() => props.navigation.navigate('SignUp')}
              navigateToPasswordReset={() => props.navigation.navigate('PasswordReset')}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="SignUp" options={{ headerShown: false }}>
          {props => (
            <SignUp
              {...props}
              handleAuthentication={handleAuthentication}
              toggleForm={() => props.navigation.navigate('Login')}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="PasswordReset" options={{ headerShown: false }}>
          {props => (
            <PasswordReset {...props} toggleForm={() => props.navigation.navigate('Login')} />
          )}
        </Stack.Screen>
      </>
    )}
  </Stack.Navigator>
);

export default AppNavigator;
