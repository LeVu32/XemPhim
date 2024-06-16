"use client";
import React, { useState } from "react";
import { Text, Button, Grid, Row } from "@nextui-org/react";
import axios, { AxiosResponse } from "axios";
import { useRouter } from "next/navigation";
import ToastMessage, { success, error, warning } from "../Toast";
import { apiLocal } from "@/config-api";

const getTokenFromLocalStorage = (): string | null => {
  return localStorage.getItem("token");
};

export const DeleteUser = ({ userId }: { userId: string }) => {
  const router = useRouter();
  const handleDeleteUser = async () => {
    try {
      const token = getTokenFromLocalStorage();
      if (!token) {
        router.push("/login");
        return;
      }
      const response: AxiosResponse = await axios.post(
        `http://${apiLocal}/api/admin/delete/user`,
        {
          _id: userId,
        },
        {
          headers: {
            Authorization: token,
          },
        }
      );

      console.log(response.data);
      success("Xoá user thành công");
      router.push("/users");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Grid.Container
      css={{ borderRadius: "14px", padding: "0.75rem", maxWidth: "330px" }}
    >
      <Row justify="center" align="center">
        <Text b>Xác nhận</Text>
      </Row>
      <Row>
        <Text>Bạn có muốn xoá user này không?</Text>
      </Row>
      <Grid.Container justify="space-between" alignContent="center">
        <Grid>
          <Button size="sm" light>
            Cancel
          </Button>
        </Grid>
        <Grid>
          <Button size="sm" shadow color="error" onPress={handleDeleteUser}>
            Delete
          </Button>
        </Grid>
      </Grid.Container>
    </Grid.Container>
  );
};
