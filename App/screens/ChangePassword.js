import React, { useState, useEffect } from "react";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  Text,
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { COLORS, SIZES } from "../constants";
import { images } from "../constants";
import { NOTIFICATIONS } from "expo-permissions";
import { linkserver } from "./IPCONFIG";

const ChangePassword = ({ navigation }) => {
  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [expoPushToken, setExpoPushToken] = useState("");

  async function changePass() {
    let data = {
      rePassword: rePassword,
      password: password,
    };
    try {
      const token = await AsyncStorage.getItem("tokenPassword");
      const res = await axios.post(
        `${linkserver}/api/user/change-password`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
            authorization: `${token}`,
          },
        }
      );

      navigation.navigate("Login");
    } catch (error) {
      Alert.alert("Thất bại", value.data.message, [
        { text: "OK", onPress: () => console.log("OK Pressed") },
      ]);
    }
  }
  return (
    <View style={styles.container}>
      <View style={styles.body}>
        <Image
          source={images.netflix}
          style={{ width: 150, height: 150 }}
        ></Image>
        <TextInput
          style={styles.input}
          placeholder="Mật khẩu mới"
          placeholderTextColor="#fff"
          defaultValue={password}
          onChangeText={(newText) => setPassword(newText)}
          textContentType="password"
        ></TextInput>

        <TextInput
          style={styles.input}
          placeholder="Xác nhận mật khẩu"
          placeholderTextColor="#fff"
          onChangeText={(newText) => setRePassword(newText)}
          textContentType="password"
        ></TextInput>
        <TouchableOpacity
          style={styles.button}
          onPress={async () => {
            await changePass();
            navigation.navigate("Login");
          }}
        >
          <Text style={{ color: "#fff", fontSize: 18 }}>Đổi Mật Khẩu</Text>
        </TouchableOpacity>

        <Text
          style={{
            color: "#fff",
            opacity: 0.6,
            fontSize: 12,
            marginTop: 20,
            textDecorationLine: "underline",
          }}
          onPress={() => {
            navigation.navigate("Login");
          }}
        >
          Trang chủ
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  header: {
    marginTop: SIZES.padding * 2,
  },
  body: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    width: 300,
    height: 45,
    borderRadius: 4,
    backgroundColor: "#303030",
    color: "#fff",
    margin: 8,
    padding: 10,
  },
  button: {
    marginTop: 8,
    borderColor: "#000",
    borderWidth: 0.5,
    width: 300,
    height: 50,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
});
export default ChangePassword;
