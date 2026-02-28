import { View, Text, StyleSheet, Platform, Alert } from "react-native";
import * as AppleAuthentication from "expo-apple-authentication";
import { signInWithApple } from "../lib/auth";
import { useRouter } from "expo-router";

export default function LoginScreen() {
  const router = useRouter();

  const handleAppleSignIn = async () => {
    try {
      await signInWithApple();
      router.replace("/(tabs)");
    } catch (e: any) {
      if (e.code !== "ERR_REQUEST_CANCELED") {
        Alert.alert("Erreur", "La connexion Apple a échoué.");
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.logo}>Mark</Text>
        <Text style={styles.tagline}>
          Tous vos messages,{"\n"}un seul endroit.
        </Text>
      </View>

      <View style={styles.bottom}>
        {Platform.OS === "ios" ? (
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={
              AppleAuthentication.AppleAuthenticationButtonType.CONTINUE
            }
            buttonStyle={
              AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
            }
            cornerRadius={12}
            style={styles.appleButton}
            onPress={handleAppleSignIn}
          />
        ) : (
          <Text style={styles.iosOnly}>
            Apple Sign-In est disponible uniquement sur iOS.
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingBottom: 60,
  },
  hero: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    fontSize: 52,
    fontWeight: "900",
    color: "#000",
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
    marginTop: 12,
    lineHeight: 26,
  },
  bottom: {
    alignItems: "center",
  },
  appleButton: {
    width: "100%",
    height: 52,
  },
  iosOnly: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
});
