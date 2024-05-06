"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  createTheme,
  NextUIProvider,
  Navbar,
  Button,
  Link,
  Text,
} from "@nextui-org/react";
import RootLayout from "./layout";
import Content from "./content";
import ToastMessage from "@/app/Toast";

const darkTheme = createTheme({
  type: "dark",
  theme: {
    colors: {},
  },
});
export default function Page({ params }: { params: { slug: string } }) {
  return (
    <div>
      <NextUIProvider theme={darkTheme}>
        <RootLayout>
          <Navbar isCompact isBordered variant="sticky" className="z-[2]">
            <Navbar.Brand>
              {/* <AcmeLogo /> */}
              <Text b color="inherit" hideIn="xs">
                ADMIN
              </Text>
            </Navbar.Brand>
            <Navbar.Content hideIn="xs" variant="underline">
              <Navbar.Link href="/">Home</Navbar.Link>
              <Navbar.Link href="/films">Films</Navbar.Link>
              <Navbar.Link href="/users">Users</Navbar.Link>
            </Navbar.Content>
            <Navbar.Content>
              <Navbar.Item>
                <Button auto flat as={Link} href="#">
                  Đăng Xuất
                </Button>
              </Navbar.Item>
            </Navbar.Content>
          </Navbar>

          <Content params={params}></Content>
        </RootLayout>
        <ToastMessage />
      </NextUIProvider>
    </div>
  );
}
