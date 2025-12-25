import { useState, useEffect } from "react";
import { Plus, Trash2, Check, Edit2, X, CheckCircle2, Flag, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Priority = "high" | "medium" | "low";
type Category = "work" | "personal" | "shopping" | "health" | "other";

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
  priority: Priority;
  category: Category;
}

const priorities: { value: Priority; label: string; color: string }[] = [
  { value: "high", label: "High", color: "bg-priority-high" },
  { value: "medium", label: "Medium", color: "bg-priority-medium" },
  { value: "low", label: "Low", color: "bg-priority-low" },
];

const categories: { value: Category; label: string; color: string }[] = [
  { value: "work", label: "Work", color: "bg-category-work" },
  { value: "personal", label: "Personal", color: "bg-category-personal" },
  { value: "shopping", label: "Shopping", color: "bg-category-shopping" },
  { value: "health", label: "Health", color: "bg-category-health" },
  { value: "other", label: "Other", color: "bg-category-other" },
];

const getPriorityColor = (priority: Priority) => {
  return priorities.find((p) => p.value === priority)?.color || "bg-muted";
};

const getCategoryColor = (category: Category) => {
  return categories.find((c) => c.value === category)?.color || "bg-muted";
};

export function TodoList() {
  const [todos, setTodos] = useState<Todo[]>(() => {
    const saved = localStorage.getItem("todos");
    if (saved) {
      const parsed = JSON.parse(saved);
      // Migrate old todos without priority/category
      return parsed.map((todo: Todo) => ({
        ...todo,
        priority: todo.priority || "medium",
        category: todo.category || "other",
      }));
    }
    return [];
  });
  const [newTodo, setNewTodo] = useState("");
  const [newPriority, setNewPriority] = useState<Priority>("medium");
  const [newCategory, setNewCategory] = useState<Category>("other");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [editPriority, setEditPriority] = useState<Priority>("medium");
  const [editCategory, setEditCategory] = useState<Category>("other");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  const addTodo = () => {
    if (!newTodo.trim()) {
      toast.error("Please enter a task");
      return;
    }

    const todo: Todo = {
      id: Date.now().toString(),
      text: newTodo.trim(),
      completed: false,
      createdAt: Date.now(),
      priority: newPriority,
      category: newCategory,
    };

    setTodos((prev) => [todo, ...prev]);
    setNewTodo("");
    setNewPriority("medium");
    setNewCategory("other");
    toast.success("Task added successfully!");
  };

  const toggleComplete = (id: string) => {
    setTodos((prev) =>
      prev.map((todo) => {
        if (todo.id === id) {
          const newCompleted = !todo.completed;
          if (newCompleted) {
            toast.success("Task completed!", {
              icon: <CheckCircle2 className="w-4 h-4 text-success" />,
            });
          }
          return { ...todo, completed: newCompleted };
        }
        return todo;
      })
    );
  };

  const startEdit = (todo: Todo) => {
    setEditingId(todo.id);
    setEditText(todo.text);
    setEditPriority(todo.priority);
    setEditCategory(todo.category);
  };

  const saveEdit = () => {
    if (!editText.trim()) {
      toast.error("Task cannot be empty");
      return;
    }

    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === editingId
          ? { ...todo, text: editText.trim(), priority: editPriority, category: editCategory }
          : todo
      )
    );
    setEditingId(null);
    setEditText("");
    toast.success("Task updated!");
  };

  const confirmDelete = () => {
    if (deleteId) {
      setTodos((prev) => prev.filter((todo) => todo.id !== deleteId));
      setDeleteId(null);
      toast.success("Task deleted!");
    }
  };

  const completedCount = todos.filter((t) => t.completed).length;

  return (
    <div className="glass-card-glow p-6 md:p-8 animate-fade-up">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
            <CheckCircle2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">To-Do List</h2>
            <p className="text-sm text-muted-foreground">
              {completedCount} of {todos.length} completed
            </p>
          </div>
        </div>
      </div>

      {/* Add Todo Form */}
      <div className="space-y-3 mb-6">
        <div className="flex gap-3">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTodo()}
            placeholder="Add a new task..."
            className="flex-1 px-4 py-3 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
          <Button onClick={addTodo} size="lg">
            <Plus className="w-5 h-5" />
          </Button>
        </div>
        <div className="flex gap-3 flex-wrap">
          <Select value={newPriority} onValueChange={(v: Priority) => setNewPriority(v)}>
            <SelectTrigger className="w-[140px] bg-input border-border">
              <Flag className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              {priorities.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${p.color}`} />
                    {p.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={newCategory} onValueChange={(v: Category) => setNewCategory(v)}>
            <SelectTrigger className="w-[140px] bg-input border-border">
              <Tag className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${c.color}`} />
                    {c.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Todo List */}
      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
        {todos.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No tasks yet. Add one above!</p>
          </div>
        ) : (
          todos.map((todo, index) => (
            <div
              key={todo.id}
              className="group flex items-start gap-3 p-4 rounded-xl bg-secondary/30 border border-border/50 hover:border-primary/30 transition-all animate-slide-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <button
                onClick={() => toggleComplete(todo.id)}
                className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all mt-0.5 ${
                  todo.completed
                    ? "bg-success border-success"
                    : "border-muted-foreground hover:border-primary"
                }`}
              >
                {todo.completed && <Check className="w-4 h-4 text-success-foreground" />}
              </button>

              {editingId === todo.id ? (
                <div className="flex-1 space-y-3">
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && saveEdit()}
                    className="w-full px-3 py-1.5 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    autoFocus
                  />
                  <div className="flex gap-2 flex-wrap">
                    <Select value={editPriority} onValueChange={(v: Priority) => setEditPriority(v)}>
                      <SelectTrigger className="w-[120px] h-8 bg-input border-border text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {priorities.map((p) => (
                          <SelectItem key={p.value} value={p.value}>
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${p.color}`} />
                              {p.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={editCategory} onValueChange={(v: Category) => setEditCategory(v)}>
                      <SelectTrigger className="w-[120px] h-8 bg-input border-border text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c.value} value={c.value}>
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${c.color}`} />
                              {c.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button size="sm" onClick={saveEdit} className="h-8">
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingId(null)} className="h-8">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex-1 min-w-0">
                    <span
                      className={`block text-foreground transition-all ${
                        todo.completed ? "line-through opacity-50" : ""
                      }`}
                    >
                      {todo.text}
                    </span>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(
                          todo.priority
                        )} text-primary-foreground`}
                      >
                        <Flag className="w-3 h-3" />
                        {priorities.find((p) => p.value === todo.priority)?.label}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(
                          todo.category
                        )} text-primary-foreground`}
                      >
                        <Tag className="w-3 h-3" />
                        {categories.find((c) => c.value === todo.category)?.label}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => startEdit(todo)}
                      className="h-8 w-8"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setDeleteId(todo.id)}
                      className="h-8 w-8 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="glass-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The task will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
