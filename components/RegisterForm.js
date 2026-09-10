import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { apiRequest } from '../lib/auth';

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;

const RegisterForm = ({ onSuccess, onLogin }) => {
	const [form, setForm] = useState({ email: '', username: '', password: '' });
	const [verificationCode, setVerificationCode] = useState('');
	const [isVerificationStep, setIsVerificationStep] = useState(false);
	const [error, setError] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);

	const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  }

	const handleRegister = async () => {
		const email = form.email.trim().toLowerCase();
		const username = form.username.trim();

		if (!EMAIL_PATTERN.test(email)) {
      return setError('Enter a valid email address.');
    }
		if (username.length < 3 || username.length > 50) {
      return setError('Username must be 3 to 50 characters.');
    }
		if (form.password.length < 8) {
      return setError('Password must be at least 8 characters.');
    }

		setError('');
		setIsSubmitting(true);

		try {
			const { data } = await apiRequest('/auth/register', { 
        method: 'POST', 
        body: { email, username, password: form.password } 
      });

			if (data.emailVerificationRequired) {
        setIsVerificationStep(true);
      }
			else {
        onSuccess();
      }
		} 
    catch (requestError) {
			setError(requestError.message);
		} 
    finally {
			setIsSubmitting(false);
		}
	}

	const handleVerification = async () => {
		if (!verificationCode.trim()) {
      return setError('Enter the verification code from your email.');
    }

		setError('');
		setIsSubmitting(true);

		try {
			await apiRequest('/auth/verify-email', { 
        method: 'POST', 
        body: { 
          email: form.email.trim().toLowerCase(), 
          code: verificationCode.trim() 
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

  //renders when verification code needs to be submitted
	if (isVerificationStep) {
		return (
			<View>
				<Text style={styles.info}>Enter the verification code sent to {form.email.trim()}</Text>
				<TextInput 
          autoCapitalize="none" 
          keyboardType="number-pad" 
          placeholder="Verification code" 
          value={verificationCode} 
          onChangeText={setVerificationCode} 
          style={styles.input} 
        />
				{!!error && <Text style={styles.error}>{error}</Text>}
				<Pressable 
          disabled={isSubmitting} 
          onPress={handleVerification} 
          style={styles.primaryButton}>{isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryText}>Verify email</Text>}
        </Pressable>
			</View>
		);
	}

	return (
		<View>
			<TextInput 
        autoCapitalize="none" 
        autoComplete="email" 
        keyboardType="email-address" 
        placeholder="Email" 
        value={form.email} 
        onChangeText={(value) => updateField('email', value)} 
        style={styles.input} 
      />
			<TextInput 
        autoCapitalize="none" 
        placeholder="Username" 
        value={form.username} 
        onChangeText={(value) => updateField('username', value)} 
        style={styles.input} 
      />
			<TextInput 
        autoCapitalize="none" 
        placeholder="Password" 
        secureTextEntry 
        value={form.password} 
        onChangeText={(value) => updateField('password', value)} 
        style={styles.input} 
      />
			{!!error && <Text style={styles.error}>{error}</Text>}
			<Pressable 
        disabled={isSubmitting} 
        onPress={handleRegister} 
        style={styles.primaryButton}>{isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryText}>Register</Text>}
      </Pressable>
			<Pressable 
        onPress={onLogin} 
        style={styles.secondaryButton}><Text style={styles.secondaryText}>I already have an account</Text>
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
	info: { 
    color: '#657078', 
    fontSize: 16, 
    lineHeight: 24, 
    marginBottom: 18 },
	error: { 
    color: '#b33d32', 
    marginBottom: 12 
  },
	primaryButton: { 
    alignItems: 'center', 
    backgroundColor: '#d96c3f', 
    borderRadius: 10, 
    minHeight: 54, 
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

export default RegisterForm;
