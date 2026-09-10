import { Redirect, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';
import { apiRequest } from '../lib/auth';

const LoginPage = () => {
	const router = useRouter();
	const [mode, setMode] = useState('login');
	const [isCheckingSession, setIsCheckingSession] = useState(true);
	const [isAuthenticated, setIsAuthenticated] = useState(false);

	//check if the user needs to log in/register before being sent to the home page
	useEffect(() => {
		let isMounted = true;

		apiRequest('/auth/me')
			.then(() => {
				if (isMounted) {
					setIsAuthenticated(true);
				}
			})
			.catch(() => {})
			.finally(() => {
				if (isMounted) {
					setIsCheckingSession(false);
				}
			});

		return () => {
			isMounted = false;
		};
	}, []);

	//loading animation if the app is currently checking the user session
	if (isCheckingSession) {
		return (
			<View style={styles.centered}>
				<ActivityIndicator size="large" color="#d96c3f" />
			</View>
		);
	}

	//bring the user to home page if the user is authenticated
	if (isAuthenticated) {
		return <Redirect href="/" />;
	}

	return (
		<View style={styles.container}>
			<View style={styles.brandBlock}>
				<Text style={styles.kicker}>VaporBets</Text>
				<Text style={styles.title}>{mode === 'login' ? 'Log in' : 'Create a new account'}</Text>
			</View>
			{mode === 'login' ? (
				<LoginForm
					onSuccess={() => router.replace('/')}
					onRegister={() => setMode('register')}
				/>
			) : (
				<RegisterForm
					onSuccess={() => router.replace('/')}
					onLogin={() => setMode('login')}
				/>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#f5f0e8',
		padding: 28,
		justifyContent: 'center',
	},
	centered: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#f5f0e8',
	},
	brandBlock: {
		marginBottom: 34,
	},
	kicker: {
		color: '#d96c3f',
		fontSize: 13,
		fontWeight: '800',
		letterSpacing: 2,
		marginBottom: 12,
	},
	title: {
		color: '#18252b',
		fontSize: 36,
		fontWeight: '800',
		letterSpacing: 0,
	},
	subtitle: {
		color: '#657078',
		fontSize: 16,
		marginTop: 8,
	},
});

export default LoginPage;