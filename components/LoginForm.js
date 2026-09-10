import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { apiRequest } from '../lib/auth';

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;

const LoginForm = ({ onSuccess, onRegister }) => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);

	async function handleSubmit() {
		const normalizedEmail = email.trim().toLowerCase();

		if (!EMAIL_PATTERN.test(normalizedEmail)) {
      return setError('Enter a valid email address.');
    }
		if (!password) {
      return setError('Enter your password.');
    }

		setError('');
		setIsSubmitting(true);

		try {
			await apiRequest('/auth/login', { 
        method: 'POST', 
        body: { 
          email: normalizedEmail, 
          password 
        } 
      });
      
			onSuccess();
		} 
    catch (requestError) {
			setError(requestError.message);
		} 
    finally {
			setIsSubmitting(false);
		}
	}

	return (
		<View>
			<TextInput 
        autoCapitalize="none" 
        autoComplete="email" 
        keyboardType="email-address" 
        placeholder="Email" 
        value={email} 
        onChangeText={setEmail} 
        style={styles.input} 
      />
			<TextInput 
        autoCapitalize="none" 
        placeholder="Password" 
        secureTextEntry 
        value={password} 
        onChangeText={setPassword} 
        style={styles.input} 
      />
			{!!error && <Text style={styles.error}>{error}</Text>}
			<Pressable disabled={isSubmitting} onPress={handleSubmit} style={styles.primaryButton}>
				{isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryText}>Log in</Text>}
			</Pressable>
			<Pressable 
        onPress={onRegister} 
        style={styles.secondaryButton}><Text style={styles.secondaryText}>Create an account</Text>
      </Pressable>
		</View>
	);
};

const styles = StyleSheet.create({
	input: { 
    backgroundColor: '#fff', 
    borderColor: '#d9d2c8', 
    borderRadius: 10, 
    borderWidth: 1, 
    color: '#18252b', 
    fontSize: 16, 
    marginBottom: 12, 
    padding: 16 
  },
	error: { 
    color: '#b33d32', 
    marginBottom: 12 
  },
	primaryButton: { 
    alignItems: 'center', 
    backgroundColor: '#d96c3f', 
    borderRadius: 10, minHeight: 54, 
    justifyContent: 'center', 
    marginTop: 8 
  },
	primaryText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: '800' 
  },
	secondaryButton: { 
    alignItems: 'center', 
    padding: 18 
  },
	secondaryText: { 
    color: '#385b63', 
    fontSize: 15, 
    fontWeight: '700' 
  },
});

export default LoginForm;
