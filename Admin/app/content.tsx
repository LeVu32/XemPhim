import { Card, Text, Button, Row, Avatar } from "@nextui-org/react";
import { useRouter } from "next/navigation";

export default function Content({ data }: { data: any }) {
  const router = useRouter();

  return (
    <div className="w-[80%] flex items-center justify-between m-[auto] px-[250px] mt-[60px]">
      <Card css={{ mw: "330px" }}>
        <Card.Header>
          <Text b>Phim</Text>
        </Card.Header>
        <Card.Divider />
        <Card.Body css={{ py: "$10" }}>
          <Text>Tổng số phim:</Text>
          <Avatar.Group count={data?.filmCount}>
            {data?.dataPhim?.map((name: any, index: number) => (
              <Avatar key={index} size="lg" pointer text={name.kind} stacked />
            ))}
          </Avatar.Group>
        </Card.Body>
        <Card.Divider />
        <Card.Footer>
          <Row justify="flex-end">
            <Button
              size="sm"
              onPress={() => {
                router.push("/films");
              }}
            >
              Xem
            </Button>
          </Row>
        </Card.Footer>
      </Card>
      <Card css={{ mw: "330px" }}>
        <Card.Header>
          <Text b>User</Text>
        </Card.Header>
        <Card.Divider />
        <Card.Body css={{ py: "$10" }}>
          <Text>Tổng số user:</Text>
          <Avatar.Group count={data?.userCount}>
            {data?.dataUser?.map((name: any, index: number) => {
              return (
                <Avatar
                  key={index}
                  size="lg"
                  pointer
                  text={name.role}
                  stacked
                />
              );
            })}
          </Avatar.Group>
        </Card.Body>
        <Card.Divider />
        <Card.Footer>
          <Row justify="flex-end">
            <Button
              size="sm"
              color="secondary"
              onPress={() => {
                router.push("/users");
              }}
            >
              Xem
            </Button>
          </Row>
        </Card.Footer>
      </Card>
    </div>
  );
}
