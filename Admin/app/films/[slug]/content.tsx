"use client";

import axios, { AxiosResponse } from "axios";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { DeleteUser } from "./DeleteFilm";
import { DeleteEpisode } from "./DeleteEpisode";
import { Modal, Input, Button, Popover, Text, Image } from "@nextui-org/react";
import ToastMessage, { success, error } from "@/app/Toast";

const getTokenFromLocalStorage = (): string | null => {
  return localStorage.getItem("token");
};

interface ResponseRq {
  _id: string;
  data: [];
}
function Content({ params }: { params: any }) {
  const router = useRouter();
  const [data, setData] = useState<any>();
  const [visible, setVisible] = useState(false);
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [kind, setKind] = useState<string>("");
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [base64Video, setBase64Video] = useState<string | null>(null);

  const handleUpload = async () => {
    if (!base64Image || !name || !description || !kind) {
      return;
    }
    try {
      const token = getTokenFromLocalStorage();
      if (!token) {
        router.push("/login");
        return;
      }
      console.log("click");
      const response: AxiosResponse = await axios.post(
        "http://localhost:6945/api/film/episodes",
        {
          id: params.slug,
          image: base64Image,
          video: base64Video,
          name,
          description,
          kind,
        },
        {
          headers: {
            Authorization: token,
          },
        }
      );

      console.log(response.data);
      success(response.data?.message);
    } catch (e: any) {
      console.error(e);
      error(e?.message);
    } finally {
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
            `http://localhost:1209/api/film/${params.slug}`,
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
      })();
    } catch (error) {}
  }, []);

  return (
    <div className="max-w-[1400px] mx-auto items-center ">
      <div className="my-[20px] flex content-center justify-between">
        <div>Phim:</div>
        <div className="">
          <Button bordered color="gradient" onPress={handler}>
            Thêm Tập Phim
          </Button>
        </div>
      </div>

      <div>
        <div className="flex mb-[20px]">
          <Image
            src={`http://localhost:6945/image/${data?.image}`}
            alt="hihi"
            width={800}
            height={400}
          />
        </div>
        <div className="flex items-center justify-center mb-[20px]">
          <Popover>
            <Popover.Trigger>
              <Button color="error" auto flat>
                Xoá
              </Button>
            </Popover.Trigger>
            <Popover.Content>
              <DeleteUser filmId={params.slug} />
            </Popover.Content>
          </Popover>
        </div>
        <div className="flex items-center justify-center mb-[20px]">
          <Text size="$xl" b color="inherit" hideIn="xs">
            {data?.name}
          </Text>
        </div>
        <div className="flex-col items-center justify-center mb-[30px]">
          <Text b size="$md" color="#ff4ecd" className="mr-[20px]">
            Description:
          </Text>
          <Text size="$xs" b color="inherit" hideIn="xs">
            {data?.description}
          </Text>
        </div>
        <div className="flex-col items-center justify-center">
          <Text b size="$md" color="secondary" className="mr-[20px]">
            Các Tập:
          </Text>
          <div className="flex">
            {data?.episode?.map((item: any, i: number) => {
              return (
                <div>
                  <div className="flex items-center justify-center mb-[20px]">
                    <Popover>
                      <Popover.Trigger>
                        <Button
                          auto
                          color="secondary"
                          rounded
                          flat
                          key={i}
                          className="mr-[5px]"
                        >
                          {item.name}
                        </Button>
                      </Popover.Trigger>
                      <Popover.Content>
                        <DeleteEpisode
                          filmId={params.slug}
                          idEpisode={item._id}
                        />
                      </Popover.Content>
                    </Popover>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
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
                Thêm Tập phim
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
              placeholder="Tên Tập"
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
              accept="image/*"
              size="lg"
              placeholder="Ảnh"
              className="content-center"
              onChange={(e) => {
                const file = (e.target as HTMLInputElement)?.files?.[0];
                if (file) {
                  const reader = new FileReader();

                  reader.onloadend = async () => {
                    const base64String = (await reader.result) as string;
                    console.log(base64String);
                    setBase64Image(base64String);
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
            <label>Chọn video</label>
            <Input
              clearable
              bordered
              fullWidth
              type="file"
              color="primary"
              size="lg"
              placeholder="Video"
              className="content-center"
              accept="video/*"
              onChange={(e) => {
                const file = (e.target as HTMLInputElement)?.files?.[0];
                if (file) {
                  const reader = new FileReader();

                  reader.onloadend = () => {
                    const base64String = reader.result as string;
                    setBase64Video(base64String); // Sử dụng setBase64Video để lưu chuỗi base64 của video
                    console.log(base64String);
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
