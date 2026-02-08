
'use client'

import { useState } from 'react'
import { createCourse, createModule, createLesson } from '@/app/actions/academy'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Layers, FileVideo } from 'lucide-react'
import { cn } from '@/lib/utils'

import { AcademyCourse, AcademyModule } from "@/types/academy"

interface AdminAcademyManagerProps {
  initialCourses: AcademyCourse[]
  initialModules: AcademyModule[]
}

export function AdminAcademyManager({ initialCourses, initialModules }: AdminAcademyManagerProps) {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('courses')
  
  // Form States
  const [courseForm, setCourseForm] = useState({ title: '', description: '', slug: '', thumbnail_url: '' })
  const [moduleForm, setModuleForm] = useState({ course_id: '', title: '', order: 1 })
  const [lessonForm, setLessonForm] = useState({ 
    module_id: '', title: '', type: 'video', url: '', description: '', 
    xp_reward: 50, order: 1, is_vip: true 
  })

  const handleCreateCourse = async () => {
    try {
      await createCourse(courseForm)
      toast.success('Curso creado exitosamente')
      setCourseForm({ title: '', description: '', slug: '', thumbnail_url: '' })
    } catch {
      toast.error('Error al crear curso')
    }
  }

  const handleCreateModule = async () => {
    try {
      await createModule(moduleForm)
      toast.success('Módulo creado exitosamente')
      setModuleForm({ ...moduleForm, title: '' })
    } catch {
      toast.error('Error al crear módulo')
    }
  }

  const handleCreateLesson = async () => {
    try {
      // @ts-expect-error - lessonForm type mismatch with API
      await createLesson(lessonForm)
      toast.success('Lección creada exitosamente')
      setLessonForm({ ...lessonForm, title: '', url: '' })
    } catch {
      toast.error('Error al crear lección')
    }
  }

  const TabButton = ({ value, label }: { value: string, label: string }) => (
    <button
      onClick={() => setActiveTab(value)}
      className={cn(
        "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
        activeTab === value 
          ? "bg-gray-900 text-white shadow" 
          : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
      )}
    >
      {label}
    </button>
  )

  return (
    <div className="w-full space-y-6">
      <div className="flex space-x-2 bg-gray-100 p-1 rounded-xl w-fit">
        <TabButton value="courses" label="Cursos" />
        <TabButton value="modules" label="Módulos" />
        <TabButton value="lessons" label="Lecciones" />
      </div>

      {/* COURSES TAB */}
      {activeTab === 'courses' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
                <CardHeader>
                    <CardTitle>Crear Nuevo Curso</CardTitle>
                    <CardDescription>Define la estructura principal.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Título</Label>
                        <Input 
                            value={courseForm.title} 
                            onChange={e => setCourseForm({...courseForm, title: e.target.value})} 
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Slug (URL amigable)</Label>
                        <Input 
                            value={courseForm.slug} 
                            placeholder="ej: fundamentos-ventas"
                            onChange={e => setCourseForm({...courseForm, slug: e.target.value})} 
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Descripción</Label>
                        <Textarea 
                            value={courseForm.description} 
                            onChange={e => setCourseForm({...courseForm, description: e.target.value})} 
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Thumbnail URL</Label>
                        <Input 
                            value={courseForm.thumbnail_url} 
                            placeholder="https://..."
                            onChange={e => setCourseForm({...courseForm, thumbnail_url: e.target.value})} 
                        />
                    </div>
                    <Button onClick={handleCreateCourse} className="w-full">
                        <Plus className="w-4 h-4 mr-2" /> Crear Curso
                    </Button>
                </CardContent>
            </Card>

            <div className="space-y-4">
                <h3 className="font-bold text-lg">Cursos Existentes</h3>
                {initialCourses.map(c => (
                    <div key={c.id} className="p-4 border rounded-lg flex items-center justify-between bg-white dark:bg-gray-900">
                        <div>
                            <p className="font-bold">{c.title}</p>
                            <p className="text-xs text-gray-500">/{c.slug}</p>
                        </div>
                        <span className={c.is_published ? "text-green-500 text-xs" : "text-yellow-500 text-xs"}>
                            {c.is_published ? 'Publicado' : 'Borrador'}
                        </span>
                    </div>
                ))}
            </div>
        </div>
      )}

      {/* MODULES TAB */}
      {activeTab === 'modules' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
                <CardHeader>
                    <CardTitle>Agregar Módulo</CardTitle>
                    <CardDescription>Agrupa lecciones dentro de un curso.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Seleccionar Curso</Label>
                        <Select onValueChange={v => setModuleForm({...moduleForm, course_id: v})}>
                            <SelectTrigger>
                                <SelectValue placeholder="Elige un curso" />
                            </SelectTrigger>
                            <SelectContent>
                                {initialCourses.map(c => (
                                    <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Título del Módulo</Label>
                        <Input 
                            value={moduleForm.title} 
                            onChange={e => setModuleForm({...moduleForm, title: e.target.value})} 
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Orden</Label>
                        <Input 
                            type="number"
                            value={moduleForm.order} 
                            onChange={e => setModuleForm({...moduleForm, order: parseInt(e.target.value)})} 
                        />
                    </div>
                    <Button onClick={handleCreateModule} className="w-full">
                        <Layers className="w-4 h-4 mr-2" /> Crear Módulo
                    </Button>
                </CardContent>
            </Card>
            
             <div className="space-y-4">
                <h3 className="font-bold text-lg">Módulos Existentes</h3>
                {initialModules.map(m => (
                    <div key={m.id} className="p-4 border rounded-lg bg-white dark:bg-gray-900">
                        <p className="font-bold">{m.title}</p>
                        <p className="text-xs text-gray-500">
                            Curso: {initialCourses.find(c => c.id === m.course_id)?.title || 'Desconocido'}
                        </p>
                    </div>
                ))}
            </div>
        </div>
      )}

      {/* LESSONS TAB */}
      {activeTab === 'lessons' && (
        <Card>
            <CardHeader>
                <CardTitle>Subir Contenido (Lección)</CardTitle>
                <CardDescription>Sube videos, PDFs o audios.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Módulo</Label>
                        <Select onValueChange={v => setLessonForm({...lessonForm, module_id: v})}>
                            <SelectTrigger>
                                <SelectValue placeholder="Elige un módulo" />
                            </SelectTrigger>
                            <SelectContent>
                                {initialModules.map(m => (
                                    <SelectItem key={m.id} value={m.id}>{m.title}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Tipo</Label>
                        <Select 
                            defaultValue="video"
                            onValueChange={v => setLessonForm({...lessonForm, type: v as 'video' | 'pdf' | 'audio'})}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="video">Video (YouTube/Vimeo)</SelectItem>
                                <SelectItem value="pdf">PDF</SelectItem>
                                <SelectItem value="audio">Audio</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Título</Label>
                    <Input 
                        value={lessonForm.title} 
                        onChange={e => setLessonForm({...lessonForm, title: e.target.value})} 
                    />
                </div>
                
                <div className="space-y-2">
                    <Label>URL del Contenido</Label>
                    <Input 
                        value={lessonForm.url} 
                        placeholder="https://..."
                        onChange={e => setLessonForm({...lessonForm, url: e.target.value})} 
                    />
                </div>

                <div className="space-y-2">
                    <Label>Descripción</Label>
                    <Textarea 
                        value={lessonForm.description} 
                        onChange={e => setLessonForm({...lessonForm, description: e.target.value})} 
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>XP Recompensa</Label>
                        <Input 
                            type="number"
                            value={lessonForm.xp_reward} 
                            onChange={e => setLessonForm({...lessonForm, xp_reward: parseInt(e.target.value)})} 
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Orden</Label>
                        <Input 
                            type="number"
                            value={lessonForm.order} 
                            onChange={e => setLessonForm({...lessonForm, order: parseInt(e.target.value)})} 
                        />
                    </div>
                </div>

                <Button onClick={handleCreateLesson} className="w-full bg-green-600 hover:bg-green-700">
                    <FileVideo className="w-4 h-4 mr-2" /> Publicar Lección
                </Button>
            </CardContent>
        </Card>
      )}
    </div>
  )
}
