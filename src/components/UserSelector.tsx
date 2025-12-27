import { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { User, Plus, Settings, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';

export function UserSelector() {
  const { currentUser, users, switchUser, createUser, deleteUser, updateUser } = useUser();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [editingUser, setEditingUser] = useState<{ id: string; name: string; email: string } | null>(null);

  const handleCreateUser = () => {
    if (newUserName.trim() && newUserEmail.trim()) {
      createUser(newUserName.trim(), newUserEmail.trim());
      setNewUserName('');
      setNewUserEmail('');
      setIsCreateOpen(false);
    }
  };

  const handleEditUser = () => {
    if (editingUser && editingUser.name.trim() && editingUser.email.trim()) {
      updateUser(editingUser.id, {
        name: editingUser.name.trim(),
        email: editingUser.email.trim(),
      });
      setEditingUser(null);
      setIsEditOpen(false);
    }
  };

  const startEditUser = () => {
    if (currentUser) {
      setEditingUser({
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
      });
      setIsEditOpen(true);
    }
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('Are you sure you want to delete this user? All their data will be permanently removed.')) {
      deleteUser(userId);
    }
  };

  return (
    <div className="p-4 border-b border-border">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-muted-foreground">Current User</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setIsCreateOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New User
            </DropdownMenuItem>
            <DropdownMenuItem onClick={startEditUser}>
              <Settings className="w-4 h-4 mr-2" />
              Edit User
            </DropdownMenuItem>
            {users.length > 1 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => currentUser && handleDeleteUser(currentUser.id)}
                  className="text-red-600 dark:text-red-400"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete User
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <Select value={currentUser?.id || ''} onValueChange={switchUser}>
        <SelectTrigger className="w-full">
          <div className="flex items-center">
            <User className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Select user" />
          </div>
        </SelectTrigger>
        <SelectContent>
          {users.map((user) => (
            <SelectItem key={user.id} value={user.id}>
              <div className="flex flex-col">
                <span>{user.name}</span>
                <span className="text-xs text-muted-foreground">{user.email}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Create User Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                placeholder="Enter name"
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                placeholder="Enter email"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateUser}>
                Create User
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input
                value={editingUser?.name || ''}
                onChange={(e) => setEditingUser(editingUser ? { ...editingUser, name: e.target.value } : null)}
                placeholder="Enter name"
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={editingUser?.email || ''}
                onChange={(e) => setEditingUser(editingUser ? { ...editingUser, email: e.target.value } : null)}
                placeholder="Enter email"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditUser}>
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
