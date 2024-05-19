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
import { linkserver } from "./IPCONFIG";
const ForgotPassword = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [otp, setOTP] = useState("");
  const [expoPushToken, setExpoPushToken] = useState("");
  const [isDisabled, setIsDisabled] = useState(false);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (timer === 0 && isDisabled) {
      setIsDisabled(false);
    }

    return () => clearInterval(interval);
  }, [timer, isDisabled]);

  useEffect(() => {
    async function getToken() {
      let token = await AsyncStorage.getItem("token");
      if (token) {
        navigation.navigate("Tabs");
      } else {
      }
    }
    getToken();
  }, []);

  async function getOTP() {
    let data = {
      email: username,
    };
    try {
      const res = await axios.post(
        `${linkserver}/api/user/forgot-password`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      Alert.alert("Gửi OTP thành công", value.data.message, [
        { text: "OK", onPress: () => console.log("OK Pressed") },
      ]);
    } catch (error) {
      console.log(error.message);

      Alert.alert("Gửi OTP thất bại", value.data.message, [
        { text: "OK", onPress: () => console.log("OK Pressed") },
      ]);
    }
  }

  async function confirmOTP() {
    let data = {
      otp: otp,
      email: username,
    };
    console.log(data);
    try {
      const res = await axios.post(`${linkserver}/api/user/confirm-otp`, data, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(res.data);

      await AsyncStorage.setItem("tokenPassword", res.data.data);
      await navigation.navigate("ChangePass");
      Alert.alert("Thành công", res.data.message, [
        { text: "OK", onPress: () => console.log("OK Pressed") },
      ]);
    } catch (error) {
      console.log(error.message);
      Alert.alert("Thất bại", res.data.message, [
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
        <View
          style={{
            display: "flex",
            justifyContent: "center",
            height: "auto",
            alignContent: "center",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <TextInput
            style={{
              width: 200,
              height: 45,
              borderRadius: 4,
              backgroundColor: "#303030",
              color: "#fff",
              margin: 8,
              padding: 10,
            }}
            placeholder="Email hoặc số điện thoại"
            placeholderTextColor="#fff"
            defaultValue={username}
            onChangeText={(newText) => setUsername(newText)}
          ></TextInput>
          <TouchableOpacity
            style={{
              marginTop: 8,
              borderColor: "#000",
              borderWidth: 0.5,
              fontSize: 20,
              width: 100,
              height: 50,
              borderRadius: 4,
              justifyContent: "center",
              alignItems: "center",
            }}
            onPress={() => {
              getOTP();
            }}
            // disabled={isDisabled}
          >
            <Text>Gửi OTP</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.input}
          placeholder="OTP"
          placeholderTextColor="#fff"
          onChangeText={(newText) => setOTP(newText)}
        ></TextInput>
        <TouchableOpacity
          style={styles.button}
          onPress={async () => {
            await confirmOTP();
          }}
        >
          <Text style={{ color: "#fff", fontSize: 18 }}>Xác Nhận</Text>
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
          Đăng nhập
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 2,
    backgroundColor: COLORS.black,
  },
  header: {
    marginTop: SIZES.padding * 2,
  },
  body: {
    flex: 2,
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
export default ForgotPassword;
