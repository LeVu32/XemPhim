"use client";

import axios, { AxiosResponse } from "axios";
import Image from "next/legacy/image";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import ToastMessage, { success, error, warning } from "../Toast";

interface PostData {
  // Định nghĩa kiểu dữ liệu cho dữ liệu gửi đi trong POST request
  username: string;
  password: string;
}

const postData = async (
  data: PostData,
): Promise<{ status: number; token: string }> => {
  try {
    const response = await axios.post(
      "http://localhost:1209/api/admin/login",
      data,
    );
    success("Đăng nhập thành công");
    return response.data;
  } catch (e) {
    error("Sai tài khoản hoặc mật khẩu");
    throw new Error("Error sending POST request");
  }
};

const Login: React.FC = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const router = useRouter();
  return (
    <div className="relative bg-black text-[#fff]">
      <div className="">
        <div className="z-[-1] overflow-hidden opacity-50 ">
          <Image
            src="/bgr-img.png"
            alt="hihii"
            sizes="(max-width: 1500px) 100vw"
            width={1000}
            height={600}
            loading="lazy"
            className="overflow-hidden"
          />
        </div>
      </div>

      <div className="">
        <div className="absolute top-0 left-0 leading-[90px] fill-[#e50914] w-full">
          <Image
            src="/Icon_SVG.svg"
            alt="hihii"
            width={300}
            height={150}
            loading="lazy"
            className="fill-[#e50914]"
          />
        </div>
      </div>
      <div className="absolute top-[15%] left-[40%] w-[450px] h-[500px] mt-[0px] mx-[auto] mb-[-236px] bg-black bg-opacity-70">
        <div className="px-[68px] pt-[60px] pb-[40px]">
          <div className="text-[32px] font-semibold mb-[68px] text-[#fff]">
            Đăng nhập admin
          </div>
          <div className="flex flex-col mb-[40px]">
            <div className="pb-[16px]">
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                }}
                className="pb-[16px] w-[100%] rounded-[4px] h-[50px] py-[16px] px-[20px] border-[0] bg-[#333] focus:outline-none"
                placeholder="Tài khoản Admin"
              />
            </div>
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
                className="pb-[16px] w-[100%] rounded-[4px] h-[50px] pt-[16px] px-[20px] border-[0] bg-[#333] focus:outline-none"
                placeholder="Mật khẩu Admin"
              />
            </div>
          </div>
          <div className="mt-[24px] mb-[12px] flex items-center justify-center">
            <button
              className="font-semibold bg-[#e50914] min-h-[37px] min-w-[98px] p-[16px] w-full h-[56px] text-center rounded-[5px]"
              onClick={async () => {
                try {
                  const data = { username, password };
                  const dataRes: { status: number; token: string } =
                    await postData(data);
                  console.log(dataRes);
                  if (dataRes.token) {
                    localStorage.setItem("token", dataRes.token);
                  }
                  router.push("/");
                } catch (error) {
                  console.log(error);
                }
              }}
            >
              Đăng nhập
            </button>
          </div>
        </div>
      </div>
      <ToastMessage />
    </div>
  );
};

export default Login;
