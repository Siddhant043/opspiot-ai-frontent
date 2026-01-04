import { Button } from "@/components/ui/button";
import { EllipsisIcon, PlusIcon, SearchIcon } from "lucide-react";
import { useState } from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../ui/input-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

const members = [
  {
    name: "John Doe",
    email: "john.doe@example.com",
    role: "Admin",
  },
  {
    name: "Jane Doe",
    email: "jane.doe@example.com",
    role: "User",
  },
  {
    name: "Jim Doe",
    email: "jim.doe@example.com",
    role: "User",
  },
  {
    name: "Jill Doe",
    email: "jill.doe@example.com",
    role: "User",
  },
  {
    name: "Jack Doe",
    email: "jack.doe@example.com",
    role: "User",
  },
  {
    name: "Jill Doe",
    email: "jill.doe@example.com",
    role: "User",
  },
  {
    name: "Jill Doe",
    email: "jill.doe@example.com",
    role: "User",
  },
  {
    name: "Jill Doe",
    email: "jill.doe@example.com",
    role: "User",
  },
  {
    name: "Jill Doe",
    email: "jill.doe@example.com",
    role: "User",
  },
  {
    name: "John Doe",
    email: "john.doe@example.com",
    role: "Admin",
  },
  {
    name: "Jane Doe",
    email: "jane.doe@example.com",
    role: "User",
  },
  {
    name: "Jim Doe",
    email: "jim.doe@example.com",
    role: "User",
  },
  {
    name: "Jill Doe",
    email: "jill.doe@example.com",
    role: "User",
  },
  {
    name: "Jack Doe",
    email: "jack.doe@example.com",
    role: "User",
  },
  {
    name: "Jill Doe",
    email: "jill.doe@example.com",
    role: "User",
  },
  {
    name: "Jill Doe",
    email: "jill.doe@example.com",
    role: "User",
  },
  {
    name: "Jill Doe",
    email: "jill.doe@example.com",
    role: "User",
  },
  {
    name: "Jill Doe",
    email: "jill.doe@example.com",
    role: "User",
  },
  {
    name: "John Doe",
    email: "john.doe@example.com",
    role: "Admin",
  },
  {
    name: "Jane Doe",
    email: "jane.doe@example.com",
    role: "User",
  },
  {
    name: "Jim Doe",
    email: "jim.doe@example.com",
    role: "User",
  },
  {
    name: "Jill Doe",
    email: "jill.doe@example.com",
    role: "User",
  },
  {
    name: "Jack Doe",
    email: "jack.doe@example.com",
    role: "User",
  },
  {
    name: "Jill Doe",
    email: "jill.doe@example.com",
    role: "User",
  },
  {
    name: "Jill Doe",
    email: "jill.doe@example.com",
    role: "User",
  },
  {
    name: "Jill Doe",
    email: "jill.doe@example.com",
    role: "User",
  },
  {
    name: "Jill Doe",
    email: "jill.doe@example.com",
    role: "User",
  },
  {
    name: "John Doe",
    email: "john.doe@example.com",
    role: "Admin",
  },
  {
    name: "Jane Doe",
    email: "jane.doe@example.com",
    role: "User",
  },
  {
    name: "Jim Doe",
    email: "jim.doe@example.com",
    role: "User",
  },
  {
    name: "Jill Doe",
    email: "jill.doe@example.com",
    role: "User",
  },
  {
    name: "Jack Doe",
    email: "jack.doe@example.com",
    role: "User",
  },
  {
    name: "Jill Doe",
    email: "jill.doe@example.com",
    role: "User",
  },
  {
    name: "Jill Doe",
    email: "jill.doe@example.com",
    role: "User",
  },
  {
    name: "Jill Doe",
    email: "jill.doe@example.com",
    role: "User",
  },
  {
    name: "Jill Doe",
    email: "jill.doe@example.com",
    role: "User",
  },
];

const MembersTab = () => {
  const [search, setSearch] = useState("");
  return (
    <div>
      <div className="flex flex-col gap-2 py-4">
        <div className="flex items-center justify-between">
          <InputGroup className="w-xl">
            <InputGroupInput
              placeholder="Search members"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
          </InputGroup>
          <Button>
            <PlusIcon className="w-4 h-4" />
            Add Member
          </Button>
        </div>
        <ScrollArea className="h-[550px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/3">Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.email}>
                  <TableCell>{member.name}</TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>{member.role}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon">
                      <EllipsisIcon className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>
    </div>
  );
};

export default MembersTab;
