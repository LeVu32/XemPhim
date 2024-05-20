"use client";

import { Button, Popover } from "@nextui-org/react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DeleteUser } from "./DeleteUser";

const getTokenFromLocalStorage = (): string | null => {
  return localStorage.getItem("token");
};
interface ResponseRq {
  _id: string;
  data: [];
}
function Content() {
  const [data, setData] = useState<any>();

  const router = useRouter();

  useEffect(() => {
    try {
      (async () => {
        try {
          const token = getTokenFromLocalStorage();
          if (!token) {
            router.push("/login");
          } else {
            const response = await axios.get<ResponseRq>(
              "http://api.quyvu.xyz/api/admin/listuser",
              {
                headers: {
                  Authorization: token,
                },
              }
            );
            const { data } = response.data;
            console.log(data);
            setData(data);
          }
        } catch (e) {
          console.log(e);
        }
      })();
    } catch (error) {}
  }, []);

  return (
    <div className="max-w-[1400px] mx-auto items-center ">
      <div className="my-[20px]">Danh sách người dùng:</div>
      <div className="flex font-medium mb-[30px] border-b-[1px] text-[16px]">
        <div className="w-[5%] pl-[10px] focus:outline-none border-l-[1px]"></div>
        <div className="w-[20%] pl-[10px] focus:outline-none border-l-[1px]">
          ID
        </div>
        <div className="w-[25%] pl-[10px] focus:outline-none border-l-[1px]">
          Tên
        </div>
        <div className="w-[20%] pl-[10px] focus:outline-none border-l-[1px]">
          Username
        </div>
        <div className="w-[15%] pl-[10px] focus:outline-none border-l-[1px]">
          Role
        </div>
        <div className="w-[15%] pl-[10px] focus:outline-none border-l-[1px]">
          Chọn
        </div>
      </div>
      {data?.map((item: any, i: number) => {
        return (
          <div
            key={i}
            className="flex items-center justify-center pb-[5px] mb-[20px] border-b-[0.1px]"
          >
            <div className="w-[5%] px-[10px] focus:outline-none">{i + 1}</div>
            <div className="w-[20%] px-[10px] focus:outline-none border-l-[1px]">
              {item._id}
            </div>
            <div className="w-[25%] px-[10px] focus:outline-none">
              {item.displayname}
            </div>
            <div className="w-[20%] px-[10px] focus:outline-none">
              {item.username}
            </div>
            <div className="w-[15%] px-[10px] focus:outline-none">
              {item.role}
            </div>
            <div className="w-[15%] focus:outline-none flex items-center pl-[20px] justify-center">
              <Popover>
                <Popover.Trigger>
                  <Button color="error" auto flat>
                    Xoá
                  </Button>
                </Popover.Trigger>
                <Popover.Content>
                  <DeleteUser userId={item._id} />
                </Popover.Content>
              </Popover>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Content;
