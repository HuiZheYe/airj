/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Save, 
  Trash2, 
  Calendar as CalendarIcon, 
  ChevronRight, 
  Search,
  BookOpen,
  History
} from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface DiaryEntry {
  id: string;
  date: string;
  title: string;
  content: string;
  lastModified: number;
}

export default function App() {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Load entries from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('cream-diary-entries');
    if (saved) {
      try {
        setEntries(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved entries', e);
      }
    }
  }, []);

  // Save entries to localStorage
  useEffect(() => {
    localStorage.setItem('cream-diary-entries', JSON.stringify(entries));
  }, [entries]);

  const currentEntry = useMemo(() => 
    entries.find(e => e.id === currentId) || null
  , [entries, currentId]);

  const filteredEntries = useMemo(() => {
    return entries
      .filter(e => 
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        e.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => b.lastModified - a.lastModified);
  }, [entries, searchQuery]);

  const handleCreateNew = () => {
    const newEntry: DiaryEntry = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      title: '',
      content: '',
      lastModified: Date.now()
    };
    setEntries(prev => [newEntry, ...prev]);
    setCurrentId(newEntry.id);
  };

  const handleUpdateEntry = (updates: Partial<DiaryEntry>) => {
    if (!currentId) return;
    setEntries(prev => prev.map(e => 
      e.id === currentId ? { ...e, ...updates, lastModified: Date.now() } : e
    ));
  };

  const handleDeleteEntry = (id: string) => {
    if (confirm('确定要删除这篇日记吗？')) {
      setEntries(prev => prev.filter(e => e.id !== id));
      if (currentId === id) setCurrentId(null);
    }
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1000);
  };

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden font-sans selection:bg-primary/20 selection:text-primary">
      {/* Sidebar */}
      <aside className="w-80 border-r border-border/50 bg-card/30 flex flex-col">
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
                <BookOpen size={18} />
              </div>
              <h1 className="text-xl font-heading font-bold tracking-tight">奶油日记</h1>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleCreateNew}
              className="rounded-full hover:bg-primary/10 hover:text-primary transition-all duration-300"
            >
              <Plus size={20} />
            </Button>
          </div>

          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" size={16} />
            <Input 
              placeholder="搜索往期日记..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background/50 border-none shadow-inner focus-visible:ring-1 focus-visible:ring-primary/30 rounded-xl"
            />
          </div>
        </div>

        <ScrollArea className="flex-1 px-4 pb-6">
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {filteredEntries.map((entry) => (
                <motion.div
                  key={entry.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <button
                    onClick={() => setCurrentId(entry.id)}
                    className={cn(
                      "w-full text-left p-4 rounded-2xl transition-all duration-300 group relative overflow-hidden",
                      currentId === entry.id 
                        ? "bg-card shadow-sm ring-1 ring-border/50" 
                        : "hover:bg-card/50"
                    )}
                  >
                    {currentId === entry.id && (
                      <motion.div 
                        layoutId="active-pill"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full"
                      />
                    )}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
                        <span>{format(new Date(entry.date), 'yyyy.MM.dd')}</span>
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                          {format(new Date(entry.lastModified), 'HH:mm')}
                        </span>
                      </div>
                      <h3 className={cn(
                        "font-heading font-semibold truncate transition-colors",
                        currentId === entry.id ? "text-primary" : "text-foreground/80"
                      )}>
                        {entry.title || '无标题日记'}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-1 font-light italic">
                        {entry.content || '开始记录今天的心情...'}
                      </p>
                    </div>
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {filteredEntries.length === 0 && (
              <div className="py-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto text-muted-foreground/50">
                  <History size={24} />
                </div>
                <p className="text-sm text-muted-foreground italic">暂无相关日记</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col bg-background/50 relative">
        <AnimatePresence mode="wait">
          {currentEntry ? (
            <motion.div 
              key={currentEntry.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="flex-1 flex flex-col"
            >
              {/* Toolbar */}
              <header className="h-20 px-8 flex items-center justify-between border-b border-border/30 bg-background/80 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium uppercase tracking-widest">
                      <CalendarIcon size={12} />
                      <span>{format(new Date(currentEntry.date), 'yyyy年MM月dd日 EEEE', { locale: zhCN })}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleDeleteEntry(currentEntry.id)}
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-full px-4"
                  >
                    <Trash2 size={16} className="mr-2" />
                    删除
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="rounded-full px-6 shadow-lg shadow-primary/20 transition-all active:scale-95"
                  >
                    {isSaving ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Save size={16} />
                      </motion.div>
                    ) : (
                      <>
                        <Save size={16} className="mr-2" />
                        保存
                      </>
                    )}
                  </Button>
                </div>
              </header>

              {/* Editor */}
              <div className="flex-1 overflow-auto p-8 md:p-12 lg:p-20">
                <div className="max-w-3xl mx-auto space-y-8">
                  <Input 
                    placeholder="给今天起个标题吧..."
                    value={currentEntry.title}
                    onChange={(e) => handleUpdateEntry({ title: e.target.value })}
                    className="text-4xl md:text-5xl font-heading font-bold border-none bg-transparent p-0 h-auto focus-visible:ring-0 placeholder:text-muted-foreground/30 selection:bg-primary/20"
                  />
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground/60 italic">
                    <History size={14} />
                    <span>最后修改于 {format(currentEntry.lastModified, 'HH:mm:ss')}</span>
                  </div>

                  <Separator className="bg-border/30" />

                  <Textarea 
                    placeholder="在这里记录你的故事..."
                    value={currentEntry.content}
                    onChange={(e) => handleUpdateEntry({ content: e.target.value })}
                    className="min-h-[500px] text-lg md:text-xl font-serif leading-relaxed border-none bg-transparent p-0 focus-visible:ring-0 resize-none placeholder:text-muted-foreground/20 selection:bg-primary/20"
                  />
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-12">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-6 max-w-md"
              >
                <div className="w-24 h-24 rounded-full bg-card shadow-inner flex items-center justify-center mx-auto text-primary/20">
                  <BookOpen size={48} />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-heading font-bold text-foreground/80">开始一段新的记录</h2>
                  <p className="text-muted-foreground font-light italic">
                    “日记是写给未来的自己的一封信。”
                  </p>
                </div>
                <Button 
                  onClick={handleCreateNew}
                  className="rounded-full px-8 h-12 shadow-xl shadow-primary/10 hover:shadow-primary/20 transition-all"
                >
                  <Plus size={20} className="mr-2" />
                  新建日记
                </Button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>

      {/* Background Decoration */}
      <div className="fixed inset-0 pointer-events-none z-[-1] opacity-50">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]" />
      </div>
    </div>
  );
}
