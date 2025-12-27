import { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { User, Plus, Settings, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { ConfirmationDialog } from './ConfirmationDialog';

export function UserSelector() {
  const { currentUser, users, switchUser, createUser, deleteUser, updateUser } = useUser();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
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

  const handleDeleteUser = () => {
    if (currentUser) {
      deleteUser(currentUser.id);
      setIsDeleteOpen(false);
    }
  };

  return (
    <div className="p-4 border-b border-border">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">User</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <Settings className="w-3.5 h-3.5" />
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
                  onClick={() => setIsDeleteOpen(true)}
                  className="text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete User
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Current user display - simplified */}
      {users.length <= 1 ? (
        <div className="flex items-center gap-2 py-1">
          <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <span className="text-sm font-medium truncate">{currentUser?.name || 'No user'}</span>
        </div>
      ) : (
        <Select value={currentUser?.id || users[0]?.id || 'none'} onValueChange={switchUser}>
          <SelectTrigger className="w-full h-9">
            <SelectValue>
              {currentUser ? (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{currentUser.name}</span>
                </div>
              ) : (
                <span className="text-muted-foreground">Select user</span>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {users.filter((user, idx, arr) =>
              arr.findIndex(u => u.id === user.id) === idx
            ).map((user) => (
              <SelectItem key={user.id} value={user.id}>
                {user.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

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

      {/* Delete User Confirmation */}
      <ConfirmationDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Delete User"
        description={`This will permanently delete "${currentUser?.name}" and all their career data.`}
        confirmPhrase="DELETE"
        confirmButtonText="Delete User"
        onConfirm={handleDeleteUser}
      />
    </div>
  );
}
