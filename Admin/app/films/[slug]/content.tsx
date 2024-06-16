"use client";

import axios, { AxiosResponse } from "axios";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { DeleteUser } from "./DeleteFilm";
import { DeleteEpisode } from "./DeleteEpisode";
import { Modal, Input, Button, Popover, Text, Image } from "@nextui-org/react";
import ToastMessage, { success, error } from "@/app/Toast";
import { apiLocal } from "@/config-api";

const getTokenFromLocalStorage = (): string | null => {
  return localStorage.getItem("token");
};

interface ResponseRq {
  _id: string;
  data: any;
}
function Content({ params }: { params: any }) {
  const router = useRouter();
  const [data, setData] = useState<any>();
  const [visible, setVisible] = useState(false);
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [kind, setKind] = useState<string>("");
  const [image, setImage] = useState<string | null>(null);
  const [video, setVideo] = useState<string | null>(null);
  const [urlUploadFilm, setUrlUploadFilm] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const handleUpload = async () => {
    if (!image || !name || !description || !kind) {
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
        `http://${apiLocal}/api/admin/episodes`,
        {
          id: params.slug,
          image: image,
          video: video,
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
            `http://${apiLocal}/api/film/${params.slug}`,
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

  useEffect(() => {
    try {
      (async () => {})();
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
          <Image src={`${data?.image}`} alt="hihi" width={800} height={400} />
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
                <div key={i}>
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
              onChange={async (e) => {
                const file = (e.target as HTMLInputElement)?.files?.[0];
                if (file) {
                  const formData = new FormData();
                  formData.append("image", file);
                  const imageUrl = await axios.post(
                    "http://api.quyvu.xyz/api/admin/upload-image",
                    formData,
                    {
                      headers: {
                        "Content-Type": "multipart/form-data",
                      },
                    }
                  );
                  setImage(imageUrl.data.data);
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
              onChange={async (e) => {
                try {
                  const file = (e.target as HTMLInputElement)?.files?.[0];
                  if (file) {
                    const token = getTokenFromLocalStorage();
                    if (!token) {
                      router.push("/login");
                    } else {
                      const response = await axios.get<ResponseRq>(
                        `http://${apiLocal}/api/admin/get-upload-video`,
                        {
                          headers: {
                            Authorization: token,
                          },
                        }
                      );
                      const { url, filename }: any = response.data;
                      setUrlUploadFilm(url);
                      setVideo(filename);
                      console.log("url", url);
                      console.log("filename", filename);
                    }
                    const videoUrl = await axios.put(`${urlUploadFilm}`, file, {
                      headers: {
                        "Content-Type": file.type,
                      },
                    });
                  }
                  setIsSuccess(true);
                  console.log("isSuccess", isSuccess);
                } catch (error) {
                  setIsSuccess(false);
                  console.log(error);
                }
              }}
            />
          </Modal.Body>
          <Modal.Footer>
            <Button auto flat color="error" onPress={closeHandler}>
              Đóng
            </Button>
            <Button
              auto
              onPress={handleUpload}
              disabled={isSuccess ? false : true}
            >
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
