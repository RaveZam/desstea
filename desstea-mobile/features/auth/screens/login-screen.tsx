import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
  ScrollView,
} from "react-native";
import { useAuth } from "@/features/auth/hooks/use-auth";

const BRAND = "#6B4F3A";
const BRAND_DEEP = "#4A3427";
const BG = "#FDFAF7";
const SURFACE = "#FFFFFF";
const BORDER = "#EDE8E3";
const MUTED = "#C4B4A6";
const SECONDARY_TEXT = "#A08C7A";
const DARK_TEXT = "#1C1C1E";
const ERROR = "#C0392B";
const ERROR_BG = "#FDF2F1";

export function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<"email" | "password" | null>(null);

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await signIn(email.trim(), password);
    } catch (err: any) {
      setError(err.message ?? "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Top decorative strip */}
        <View style={styles.topStrip} />

        <View style={styles.container}>
          {/* Logo & brand */}
          <View style={styles.brandArea}>
            <View style={styles.logoWrap}>
              <Image
                source={require("@/assets/images/logo.jpg")}
                style={styles.logo}
                resizeMode="cover"
              />
            </View>
            <Text style={styles.brandName}>DessTea</Text>
            <View style={styles.dividerLine} />
            <Text style={styles.brandSub}>Branch Manager Portal</Text>
          </View>

          {/* Form card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Sign in to continue</Text>

            {/* Email */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email address</Text>
              <TextInput
                style={[
                  styles.input,
                  focusedField === "email" && styles.inputFocused,
                ]}
                value={email}
                onChangeText={setEmail}
                placeholder="your@email.com"
                placeholderTextColor={MUTED}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
                onFocus={() => setFocusedField("email")}
                onBlur={() => setFocusedField(null)}
              />
            </View>

            {/* Password */}
            <View style={[styles.fieldGroup, { marginTop: 14 }]}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={[
                  styles.input,
                  focusedField === "password" && styles.inputFocused,
                ]}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor={MUTED}
                secureTextEntry
                editable={!isLoading}
                onFocus={() => setFocusedField("password")}
                onBlur={() => setFocusedField(null)}
                onSubmitEditing={handleLogin}
                returnKeyType="done"
              />
            </View>

            {/* Error */}
            {error && (
              <View style={styles.errorBox}>
                <View style={styles.errorDot} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Submit */}
            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonLoading]}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.88}
            >
              {isLoading ? (
                <ActivityIndicator color="#FDFAF7" size="small" />
              ) : (
                <Text style={styles.buttonText}>Sign In</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer note */}
          <Text style={styles.footer}>
            Access restricted to branch manager accounts
          </Text>
        </View>

        {/* Bottom decorative strip */}
        <View style={styles.bottomStrip} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BG,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: "space-between",
  },
  topStrip: {
    height: 4,
    backgroundColor: BRAND,
    opacity: 0.15,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 28,
    paddingVertical: 40,
  },
  brandArea: {
    alignItems: "center",
    marginBottom: 32,
  },
  logoWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: BORDER,
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: BRAND,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  logo: {
    width: "100%",
    height: "100%",
  },
  brandName: {
    fontSize: 34,
    fontFamily: "CormorantGaramond_600SemiBold",
    color: BRAND_DEEP,
    letterSpacing: 0.5,
    lineHeight: 40,
  },
  dividerLine: {
    width: 28,
    height: 1,
    backgroundColor: MUTED,
    marginVertical: 10,
  },
  brandSub: {
    fontSize: 12,
    color: SECONDARY_TEXT,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    fontWeight: "500",
  },
  card: {
    backgroundColor: SURFACE,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 24,
    shadowColor: BRAND,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: DARK_TEXT,
    marginBottom: 20,
    letterSpacing: 0.1,
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    fontSize: 11.5,
    fontWeight: "600",
    color: SECONDARY_TEXT,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  input: {
    height: 46,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    color: DARK_TEXT,
    backgroundColor: BG,
  },
  inputFocused: {
    borderColor: BRAND,
    backgroundColor: SURFACE,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginTop: 16,
    padding: 12,
    backgroundColor: ERROR_BG,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#F5C6C2",
  },
  errorDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: ERROR,
    marginTop: 5,
    flexShrink: 0,
  },
  errorText: {
    fontSize: 13,
    color: ERROR,
    flex: 1,
    lineHeight: 18,
  },
  button: {
    marginTop: 20,
    height: 50,
    backgroundColor: BRAND,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonLoading: {
    opacity: 0.65,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "600",
    color: BG,
    letterSpacing: 0.5,
  },
  footer: {
    textAlign: "center",
    fontSize: 12,
    color: MUTED,
    marginTop: 20,
    letterSpacing: 0.2,
  },
  bottomStrip: {
    height: 4,
    backgroundColor: BRAND,
    opacity: 0.08,
  },
});
