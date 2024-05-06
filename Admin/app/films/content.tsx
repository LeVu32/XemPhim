"use client";

import axios, { AxiosResponse } from "axios";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Modal, Input, Button, Popover, Text } from "@nextui-org/react";
import ToastMessage, { error, success } from "../Toast";

const getTokenFromLocalStorage = (): string | null => {
  return localStorage.getItem("token");
};

interface ResponseRq {
  _id: string;
  data: [];
}
function Content() {
  const router = useRouter();
  const [data, setData] = useState<any>();
  const [visible, setVisible] = useState(false);
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [kind, setKind] = useState<string>("");
  const [idTrailer, setIdTrailer] = useState<string>("");
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [base64Video, setBase64Video] = useState<string | null>(null);

  const handleUpload = async () => {
    if (!base64Image || !name || !description || !kind || !idTrailer) {
      return;
    }
    try {
      const token = getTokenFromLocalStorage();
      if (!token) {
        router.push("/login");
        return;
      }

      const response: AxiosResponse = await axios.post(
        "http://localhost:6945/api/film/films",
        {
          image: base64Image,
          video: base64Video,
          name,
          description,
          kind,
          idTrailer,
        },
        {
          headers: {
            Authorization: token,
          },
        }
      );

      console.log(response.data);
      success("Thêm thành công");
    } catch (e: any) {
      console.error(e);
      error(e?.message);
    }
  };

  const handler = () => setVisible(true);
  const closeHandler = () => {
    setVisible(false);
    console.log("closed");
  };

  useEffect(() => {
    try {
      (async () => {
        const token = getTokenFromLocalStorage();
        if (!token) {
          router.push("/login");
        } else {
          const response = await axios.get<ResponseRq>(
            "http://localhost:1209/api/admin/listfilm",
            {
              headers: {
                Authorization: token,
              },
            }
          );
          const { data } = response.data;
          setData(data);
        }
      })();
    } catch (error) {}
  }, []);

  return (
    <div className="max-w-[1400px] mx-auto items-center ">
      <div className="my-[20px] flex content-center justify-between">
        <div>Danh sách Phim:</div>
        <div className="">
          <Button bordered color="gradient" onPress={handler}>
            Thêm Phim
          </Button>
        </div>
      </div>
      <div className="flex font-medium mb-[30px] border-b-[1px] text-[16px]">
        <div className="w-[5%] pl-[10px] focus:outline-none border-l-[1px]"></div>
        <div className="w-[20%] pl-[10px] focus:outline-none border-l-[1px]">
          ID
        </div>
        <div className="w-[25%] pl-[10px] focus:outline-none border-l-[1px]">
          Tên Phim
        </div>
        <div className="w-[20%] pl-[10px] focus:outline-none border-l-[1px]">
          Thể loại
        </div>
        <div className="w-[15%] pl-[10px] focus:outline-none border-l-[1px]">
          Số tập
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
              {item.name}
            </div>
            <div className="w-[20%] px-[10px] focus:outline-none">
              {item.kind}
            </div>
            <div className="w-[15%] px-[10px] focus:outline-none">
              {item.episode?.length}
            </div>
            <div className="w-[15%] focus:outline-none flex items-center px-[20px] content-center">
              <Button
                shadow
                color="primary"
                auto
                className="mr-[20px]"
                onPress={() => {
                  router.push(`/films/${item._id}`);
                }}
              >
                Xem
              </Button>
              {/* <Popover>
                <Popover.Trigger>
                  <Button color="error" auto flat>
                    Xoá
                  </Button>
                </Popover.Trigger>
                <Popover.Content>
                  <DeleteUser filmId={item._id} />
                </Popover.Content>
              </Popover> */}
            </div>
          </div>
        );
      })}

      <div>
        <Modal
          closeButton
          blur
          aria-labelledby="modal-title"
          open={visible}
          onClose={closeHandler}
        >
          <Modal.Header>
            <Text id="modal-title" size={18}>
              <Text b size={18}>
                Thêm Phim
              </Text>
            </Text>
          </Modal.Header>
          <Modal.Body>
            <Input
              clearable
              bordered
              fullWidth
              color="primary"
              size="lg"
              placeholder="Tên Phim"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              clearable
              bordered
              fullWidth
              color="primary"
              size="lg"
              placeholder="Miêu tả"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <Input
              clearable
              bordered
              fullWidth
              color="primary"
              size="lg"
              placeholder="Thể loại"
              value={kind}
              onChange={(e) => setKind(e.target.value)}
            />
            <label>Chọn ảnh</label>
            <Input
              clearable
              bordered
              fullWidth
              type="file"
              color="primary"
              size="lg"
              placeholder="Ảnh"
              accept="image/*"
              className="content-center"
              onChange={(e) => {
                const file = (e.target as HTMLInputElement)?.files?.[0];
                if (file) {
                  const reader = new FileReader();

                  reader.onloadend = () => {
                    const base64String = reader.result as string;
                    setBase64Image(base64String);
                  };

                  reader.readAsDataURL(file);
                }
              }}
            />
            <label>Chọn trailer</label>
            <Input
              clearable
              bordered
              fullWidth
              type="file"
              color="primary"
              size="lg"
              accept="video/*"
              placeholder="Video"
              className="content-center"
              onChange={(e) => {
                const file = (e.target as HTMLInputElement)?.files?.[0];
                if (file) {
                  const reader = new FileReader();

                  reader.onloadend = () => {
                    const base64String = reader.result as string;
                    setBase64Image(base64String);
                  };

                  reader.readAsDataURL(file);
                }
              }}
            />
          </Modal.Body>
          <Modal.Footer>
            <Button auto flat color="error" onPress={closeHandler}>
              Đóng
            </Button>
            <Button auto onPress={handleUpload}>
              Xác nhận
            </Button>
          </Modal.Footer>
          <ToastMessage />
        </Modal>
      </div>
    </div>
  );
}

export default Content;
