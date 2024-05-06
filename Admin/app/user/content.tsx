"use client";
import { Table, Row, Col, Tooltip, User, Text } from "@nextui-org/react";
import { useEffect, useState } from "react";
import { StyledBadge } from "./StyledBadge";
import { IconButton } from "./IconButton";
import { EyeIcon } from "./EyeIcon";
import { DeleteIcon } from "./DeleteIcon";
import { useRouter } from "next/navigation";
import axios from "axios";

const getTokenFromLocalStorage = (): string | null => {
  return localStorage.getItem("token");
};
interface ResponseRq {
  _id: string;
  data: [];
}
export default function Content() {
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
              "http://localhost:6945/api/admin/listuser",
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

  const columns = [
    { name: "NAME", uid: "name" },
    { name: "ROLE", uid: "role" },
    { name: "STATUS", uid: "status" },
    { name: "ACTIONS", uid: "actions" },
  ];

  console.log(data);

  const renderCell = (user: any, columnKey: any) => {
    const cellValue = user[columnKey];
    switch (columnKey) {
      case "name":
        return (
          <User squared src={""} name={cellValue} css={{ p: 0 }}>
            {user.email}
          </User>
        );
      case "role":
        return (
          <Col>
            <Row>
              <Text b size={14} css={{ tt: "capitalize" }}>
                {cellValue}
              </Text>
            </Row>
          </Col>
        );
      case "status":
        return <StyledBadge type={"active"}>{"active"}</StyledBadge>;

      case "actions":
        return (
          <Row justify="center" align="center">
            <Col css={{ d: "flex" }}>
              <Tooltip content="Details">
                <IconButton onClick={() => console.log("View user", user.id)}>
                  <EyeIcon size={20} fill="#979797" />
                </IconButton>
              </Tooltip>
            </Col>
            <Col css={{ d: "flex" }}>
              <Tooltip
                content="Delete user"
                color="error"
                onClick={() => console.log("Delete user", user.id)}
              >
                <IconButton>
                  <DeleteIcon size={20} fill="#FF0080" />
                </IconButton>
              </Tooltip>
            </Col>
          </Row>
        );
      default:
        return cellValue;
    }
  };
  return (
    <Table
      aria-label="Example table with custom cells"
      css={{
        height: "auto",
        minWidth: "100%",
      }}
      selectionMode="none"
    >
      <Table.Header columns={columns}>
        {(column) => (
          <Table.Column
            key={column.uid}
            hideHeader={column.uid === "actions"}
            align={column.uid === "actions" ? "center" : "start"}
          >
            {column.name}
          </Table.Column>
        )}
      </Table.Header>
      <Table.Body items={data}>
        {(item) => (
          <Table.Row>
            {(columnKey) => (
              <Table.Cell>{renderCell(item, columnKey)}</Table.Cell>
            )}
          </Table.Row>
        )}
      </Table.Body>
    </Table>
  );
}
