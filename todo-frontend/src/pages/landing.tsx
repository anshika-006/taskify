import type React from "react"

import { useRef, useState } from "react" 
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  CheckSquare,
  Zap,
  Users,
  Calendar,
  ArrowRight,
  Star,
  Briefcase,
  GraduationCap,
  Lightbulb,
  Home,
  Heart,
  ShoppingCart,
  User,
  DrumIcon as Drag, 
  Flag,
  Plus,
  GripVertical,
} from "lucide-react"

interface Task {
  id: string
  title: string
  description: string
  priority: "low" | "medium" | "high" | "urgent"
  assignee: string
  dueDate: string
  tags: string[]
}

interface Column {
  id: string
  title: string
  tasks: Task[]
  color: string
}

function DemoBoard() {
  const [columns, setColumns] = useState<Column[]>([
    {
      id: "todo",
      title: "To Do",
      color: "border-slate-600",
      tasks: [
        {
          id: "1",
          title: "Design new landing page",
          description: "Create wireframes and mockups",
          priority: "low",
          assignee: "Sarah",
          dueDate: "2025-01-25",
          tags: [ "ui/ux"],
        },
        {
          id: "2",
          title: "Setup database schema",
          description: "Configure PostgreSQL tables",
          priority: "medium",
          assignee: "Mike",
          dueDate: "2025-01-28",
          tags: ["backend"],
        },
      ],
    },
    {
      id: "progress",
      title: "In Progress",
      color: "border-orange-500",
      tasks: [
        {
          id: "3",
          title: "Physics assignment",
          description: "rotation",
          priority: "urgent",
          assignee: "homework",
          dueDate: "2025-01-23 18:00",
          tags: ["homework"],
        },
        {
          id: "4",
          title: "API Integration",
          description: "Connect frontend with backend services",
          priority: "low",
          assignee: "Alex",
          dueDate: "2025-01-26",
          tags: ["frontend"],
        },
      ],
    },
    {
      id: "review",
      title: "Under Review",
      color: "border-purple-500",
      tasks: [
        {
          id: "5",
          title: "Code review PR #123",
          description: "Review authentication module",
          priority: "medium",
          assignee: "John",
          dueDate: "2025-01-24",
          tags: ["review"],
        },
      ],
    },
    {
      id: "finished",
      title: "Finished",
      color: "border-green-500",
      tasks: [
        {
          id: "6",
          title: "User authentication",
          description: "Implement login and signup",
          priority: "low",
          assignee: "Emma",
          dueDate: "2025-01-22",
          tags: [ "security"],
        },
      ],
    },
  ])

  const [draggedTask, setDraggedTask] = useState<Task | null>(null)
  const [draggedFrom, setDraggedFrom] = useState<string | null>(null)

  const handleDragStart = (task: Task, columnId: string) => {
    setDraggedTask(task)
    setDraggedFrom(columnId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault()

    if (!draggedTask || !draggedFrom || draggedFrom === targetColumnId) {
      setDraggedTask(null)
      setDraggedFrom(null)
      return
    }

    setColumns((prev) => {
      const newColumns = prev.map((column) => {
        if (column.id === draggedFrom) {
          return {
            ...column,
            tasks: column.tasks.filter((task) => task.id !== draggedTask.id),
          }
        }
        if (column.id === targetColumnId) {
          return {
            ...column,
            tasks: [...column.tasks, draggedTask],
          }
        }
        return column
      })
      return newColumns
    })

    setDraggedTask(null)
    setDraggedFrom(null)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-500 text-white"
      case "high":
        return "bg-orange-500 text-white"
      case "medium":
        return "bg-yellow-500 text-black"
      case "low":
        return "bg-green-500 text-white"
      default:
        return "bg-slate-500 text-white"
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <Flag className="h-3 w-3" />
      case "high":
        return <Flag className="h-3 w-3" />
      default:
        return null
    }
  }

  return (
    <Card className="bg-slate-800/30 border-slate-700 overflow-hidden backdrop-blur-sm ">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {columns.map((column) => (
            <div
              key={column.id}
              className={`bg-slate-900/50 rounded-xl p-4 min-h-[400px] border-2 border-dashed ${column.color} transition-all duration-300 hover:bg-slate-900/70`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-white text-lg">{column.title}</h3>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-slate-700 text-slate-300">
                    {column.tasks.length}
                  </Badge>
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-slate-400 hover:text-white">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                {column.tasks.map((task) => (
                  <Card
                    key={task.id}
                    className="bg-white text-slate-900 hover:shadow-lg transition-all duration-200 cursor-move hover:scale-[1.02] group"
                    draggable
                    onDragStart={() => handleDragStart(task, column.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-semibold text-sm leading-tight flex-1 pr-2">{task.title}</h4>
                        <div className="flex items-center gap-1">
                          <GripVertical className="h-4 w-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                          <Badge className={`text-xs px-2 py-1 ${getPriorityColor(task.priority)}`}>
                            <div className="flex items-center gap-1">
                              {getPriorityIcon(task.priority)}
                              {task.priority}
                            </div>
                          </Badge>
                        </div>
                      </div>

                      {task.description && (
                        <p className="text-sm text-slate-600 mb-3 line-clamp-2">{task.description}</p>
                      )}

                      <div className="flex flex-wrap gap-1 mb-3">
                        {task.tags.map((tag, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs bg-slate-100 text-slate-700 hover:bg-slate-200"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>{task.assignee}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{task.dueDate}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {column.tasks.length === 0 && (
                  <div className="text-center text-slate-500 text-sm mt-12 py-8 border-2 border-dashed border-slate-700 rounded-lg">
                    <div className="flex flex-col items-center gap-2">
                      <Plus className="h-8 w-8 text-slate-600" />
                      <p>Drop tasks here or create new ones</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 text-center">
          <p className="text-slate-400 text-sm">
            💡 <strong>Pro tip:</strong> Drag any task card to move it between columns and see the magic happen!
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export default function LandingPage() {
  const demoSectionRef = useRef<HTMLDivElement>(null);

  const handleWatchDemoClick = () => {
    demoSectionRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  const templates = [
    {
      name: "Personal Tasks",
      description: "Organize your daily personal activities",
      icon: User,
      color: "from-purple-500 to-purple-700",
      bgColor: "bg-purple-500",
    },
    {
      name: "Work Projects",
      description: "Manage professional projects efficiently",
      icon: Briefcase,
      color: "from-green-500 to-green-700",
      bgColor: "bg-green-500",
    },
    {
      name: "Creative Ideas",
      description: "Capture and develop creative concepts",
      icon: Lightbulb,
      color: "from-orange-500 to-orange-700",
      bgColor: "bg-orange-500",
    },
    {
      name: "Study Goals",
      description: "Track academic progress and assignments",
      icon: GraduationCap,
      color: "from-blue-500 to-blue-700",
      bgColor: "bg-blue-500",
    },
    {
      name: "Home & Family",
      description: "Coordinate household and family tasks",
      icon: Home,
      color: "from-pink-500 to-pink-700",
      bgColor: "bg-pink-500",
    },
    {
      name: "Health & Fitness",
      description: "Monitor wellness and fitness goals",
      icon: Heart,
      color: "from-teal-500 to-teal-700",
      bgColor: "bg-teal-500",
    },
    {
      name: "Shopping Lists",
      description: "Keep track of purchases and needs",
      icon: ShoppingCart,
      color: "from-red-500 to-red-700",
      bgColor: "bg-red-500",
    },
  ]

  const features = [
    {
      icon: Drag,
      title: "Drag & Drop Interface",
      description: "Intuitive task management with seamless drag-and-drop functionality across columns",
    },
    {
      icon: CheckSquare,
      title: "Multiple Board Templates",
      description: "7 pre-built templates for different use cases - from personal tasks to work projects",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Built for speed and efficiency to help you stay productive and focused",
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Work together seamlessly with shared boards and real-time updates",
    },
    {
      icon: Calendar,
      title: "Smart Organization",
      description: "Advanced filtering, calendar integration, and priority management",
    },
    {
      icon: Star,
      title: "Customizable Workflow",
      description: "Adapt boards to your unique workflow with custom columns and labels",
    },
  ]

  return (
    <div className="min-h-screen bg-slate-950 text-white min-w-full">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckSquare className="h-8 w-8 text-blue-500" />
            <span className="text-2xl font-bold">Taskify</span>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="#features" className="text-slate-300 hover:text-white transition-colors">
              Features
            </Link>
            <Link to="#templates" className="text-slate-300 hover:text-white transition-colors">
              Templates
            </Link>
            <Link to="#pricing" className="text-slate-300 hover:text-white transition-colors">
              Pricing
            </Link>
          </nav>
          <div className="flex items-center space-x-4">
            <Link to="/signin">
              <Button variant="ghost" className="text-slate-300 hover:text-white">
                Sign In
              </Button>
            </Link>
            <Link to="/signup">
              <Button className="bg-blue-600 hover:bg-blue-700">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <Badge className="mb-6 bg-blue-500/10 text-blue-400 border-blue-500/20">
              ✨ 7 Built-in Templates Available
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Organize Everything
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Effortlessly
              </span>
            </h1>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              Transform your productivity with Taskify's intuitive drag-and-drop interface. Choose from 7 specialized
              templates and manage tasks like never before.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/signup">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6">
                  Start Free Today
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-800 text-lg px-8 py-6 bg-transparent"
                onClick={handleWatchDemoClick}
              >
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-slate-950">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Everything you need to stay organized and productive, all in one place
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all duration-300 hover:scale-105"
              >
                <CardContent className="p-6">
                  <feature.icon className="h-12 w-12 text-blue-500 mb-4" />
                  <h3 className="text-xl font-semibold mb-2 text-white">{feature.title}</h3>
                  <p className="text-slate-300">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Templates Section */}
      <section id="templates" className="py-20 px-4 bg-slate-900">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">7 Ready-to-Use Templates</h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Jump-start your productivity with our professionally designed templates
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {templates.map((template, index) => (
              <Card
                key={index}
                className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all duration-300 hover:scale-105 group"
              >
                <CardContent className="p-6">
                  <div
                    className={`w-12 h-12 rounded-lg ${template.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                  >
                    <template.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-white">{template.name}</h3>
                  <p className="text-slate-300 text-sm">{template.description}</p>
                  <Badge className="mt-3 bg-slate-700 text-slate-300">Template</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section
        ref={demoSectionRef}
        id="demo-section"  
        className="py-20 px-4 bg-slate-950"
      >
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">See Taskify in Action</h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Experience the smooth drag-and-drop interface that makes task management a breeze
            </p>
            <Badge className="mt-4 bg-blue-500/10 text-blue-400 border-blue-500/20">
              ✨ Try dragging tasks between columns!
            </Badge>
          </div>

          <div className="max-w-7xl mx-auto">
            <DemoBoard />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-slate-950">
        <div className="container mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold mb-6">Ready to Get Organized?</h2>
            <p className="text-xl text-slate-300 mb-8">
              Join thousands of users who have transformed their productivity with Taskify
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/signup">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6">
                  Start Your Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <p className="text-slate-400 text-sm">No credit card required • Free forever plan available</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-12 px-4 bg-slate-950">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <CheckSquare className="h-6 w-6 text-blue-500" />
                <span className="text-xl font-bold">Taskify</span>
              </div>
              <p className="text-slate-400">The ultimate task management solution for individuals and teams.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <Link to="#" className="hover:text-white transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:text-white transition-colors">
                    Templates
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:text-white transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:text-white transition-colors">
                    Integrations
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <Link to="#" className="hover:text-white transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:text-white transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:text-white transition-colors">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:text-white transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <Link to="#" className="hover:text-white transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:text-white transition-colors">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:text-white transition-colors">
                    Community
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:text-white transition-colors">
                    Status
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400">
            <p>&copy; {new Date().getFullYear()} Taskify. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}