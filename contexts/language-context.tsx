/* eslint-disable perfectionist/sort-objects */
"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

type Language = "tr" | "en"

interface LanguageContextType {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: keyof typeof tr, params?: Record<string, string | number>) => string
}

const tr = {
  // App general
  app_title: "Kitap Yazma ve Dünya İnşa Etme",
  welcome: "Hoş Geldiniz",
  welcome_description:
    "Kitap yazma ve dünya inşa etme uygulamasına hoş geldiniz. Bu uygulama ile kitap serileri yazabilir, karakterler ve mekanlar gibi dünya inşa etme öğeleri oluşturabilir ve bunları yazılarınızda dinamik olarak kullanabilirsiniz.",
  get_started: "Başlamak için yeni bir proje oluşturun veya mevcut bir projeyi yükleyin.",

  // Navigation
  home: "Ana Sayfa",
  projects: "Projeler",
  books: "Kitaplar",
  entities: "Öğeler",
  settings: "Ayarlar",

  // Actions
  new_project: "Yeni Proje",
  load_project: "Proje Yükle",
  save: "Kaydet",
  delete: "Sil",
  edit: "Düzenle",
  cancel: "İptal",
  create: "Oluştur",
  load: "Yükle",
  creating: "Oluşturuluyor...",
  confirm: "Onayla",
  status: "Durum",

  // common
  no_item_found: "Öğe bulunamadı",
  unsaved_changes: "Kaydedilmemiş Değişiklikler Var",
  unsaved_changes_message: "Kaydedilmemiş değişiklikleriniz var. Devam etmek istediğinizden emin misiniz?",

  // Projects
  your_projects: "Projeleriniz",
  autosaved_projects: "Otomatik Kaydedilmiş Projeler",
  no_projects_yet: "Henüz hiç proje yok. Yeni bir proje oluşturun.",
  no_autosaved_projects: "Henüz hiç otomatik kaydedilmiş proje yok.",
  untitled_project: "Başlıksız Proje",

  // World
  world_items_tab: "Varlıklar",

  // Books
  new_book: "Yeni Kitap",
  no_books_yet: "Henüz hiç kitap yok.",
  create_first_book: "İlk Kitabınızı Oluşturun",
  create_new_book: "Yeni kitap oluştur",
  untitled_book: "Başlıksız Kitap",
  books_tab: "Kitaplar",

  // Chapters
  chapters: "Bölümler",
  new_chapter: "Yeni Bölüm",
  no_chapters_yet: "Henüz hiç bölüm yok.",
  create_first_chapter: "İlk Bölümünüzü Oluşturun",
  untitled_chapter: "Başlıksız Bölüm",

  // Content
  no_description: "Açıklama yok",
  add_description: "Açıklama ekleyin",
  empty: "boş",

  // Status
  draft: "Taslak",
  in_progress: "Devam Ediyor",
  completed: "Tamamlandı",

  // Counts
  book_count: "Kitap Sayısı",
  entity_count: "Öğe Sayısı",

  // Dates
  created: "Oluşturulma",
  last_updated: "Son Güncelleme",
  unknown: "Bilinmiyor",

  // Loading
  loading: "Yükleniyor...",

  // Autosave
  autosaved: "Otomatik Kaydedilmiş",

  // entity types
  character: "Karakter",
  location: "Mekan",
  item: "Eşya",
  event: "Olay",
  characters: "Karakterler",
  locations: "Mekanlar",
  items: "Eşyalar",
  events: "Olaylar",

  project_loading: "Proje Yükleniyor...",
  project_loading_error: "Proje Yüklenme Hatası",
  project_load_failed: "Proje yüklenemedi. Lütfen tekrar deneyin.",
  try_again: "Tekrar Dene",
  reload_project: "Proje Yeniden Yükle",
  project_saved: "Proje Kaydedildi",
  project_saved_electron: "Proje dosya sistemine kaydedildi.",
  project_saved_browser: "Proje tarayıcı depolama alanına kaydedildi.",
  project_save_error: "Proje Kayıt Hatası",
  project_save_failed: "Projenizi kaydetme sırasında bir hata oluştu. Lütfen tekrar deneyin.",
  book_deleted_with_chapters: "{count} bölümle birlikte kitap silindi",
  entity_deleted: "Öğe silindi",
  entity_references_cleaned: "Öğe referansları tüm bölümlerden temizlendi",
  image_deleted: "Resim silindi",
  image_references_cleaned: "Resim referansları tüm konumlarından temizlendi",
  chapter_created: "Bölüm oluşturuldu",
  chapter_created_description: "Bölüm oluşturuldu: {title}",
  add_new_chapter: "Yeni Bölüm Ekle",

  book_statistics: "Kitap istatistikleri",
  chapter_count: "Bölüm Sayısı",
  used_items: "Kullanılan Eşyalar",
  images_tab: "Resimler"
}

const translations: Record<Language, typeof tr> = {
  tr,
  en: {
    // App general
    app_title: "Book Writing and World Building",
    welcome: "Welcome",
    welcome_description: "Welcome to the book writing and world building application. With this app, you can write book series, create world-building elements like characters and locations, and use them dynamically in your writings.",
    get_started: "Get started by creating a new project or loading an existing one.",

    // Navigation
    home: "Home",
    projects: "Projects",
    books: "Books",
    entities: "Entities",
    settings: "Settings",

    // Actions
    new_project: "New Project",
    load_project: "Load Project",
    save: "Save",
    delete: "Delete",
    edit: "Edit",
    cancel: "Cancel",
    create: "Create",
    load: "Load",

    // Projects
    your_projects: "Your Projects",
    autosaved_projects: "Autosaved Projects",
    no_projects_yet: "No projects yet. Create a new project.",
    no_autosaved_projects: "No autosaved projects yet.",
    untitled_project: "Untitled Project",

    // Books
    new_book: "New Book",
    no_books_yet: "No books yet.",
    create_first_book: "Create Your First Book",
    untitled_book: "Untitled Book",
    books_tab: "Books",

    // World
    world_items_tab: "World Items",

    // Chapters
    chapters: "Chapters",
    new_chapter: "New Chapter",
    no_chapters_yet: "No chapters yet.",
    create_first_chapter: "Create Your First Chapter",
    untitled_chapter: "Untitled Chapter",

    // Content
    no_description: "No description",
    add_description: "Add description",
    empty: "empty",

    // Status
    draft: "Draft",
    in_progress: "In Progress",
    completed: "Completed",

    // Counts
    book_count: "Book Count",
    entity_count: "Entity Count",

    // Dates
    created: "Created",
    last_updated: "Last Updated",
    unknown: "Unknown",

    // Loading
    loading: "Loading...",

    // Autosave
    autosaved: "Autosaved",

    project_loading: "Project loading...",
    project_loading_error: "Project Loading Error",
    project_load_failed: "Project failed to load. Please try again.",
    try_again: "Try Again",
    reload_project: "Reload Project",
    project_saved: "Project saved",
    project_saved_electron: "Project saved to file system.",
    project_saved_browser: "Project saved to browser storage.",
    project_save_error: "Project save error",
    project_save_failed: "An error occurred while saving your project. Please try again.",
    book_deleted_with_chapters: "Book deleted with {count} chapters",
    entity_deleted: "Entity deleted",
    entity_references_cleaned: "Entity references cleaned from chapters",
    image_deleted: "Image deleted",
    image_references_cleaned: "Image references cleaned from all locations",

    creating: "Creating...",

    // common
    no_item_found: "Item not found",

    // entity types
    character: "Character",
    location: "Location",
    item: "Item",
    event: "Event",
    characters: "Characters",
    locations: "Locations",
    items: "Items",
    events: "Events",
  },
}

// Format translation with parameters
export function formatTranslation(template: string, params?: Record<string, string | number>): string {
  if (!params) return template

  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return params[key]?.toString() || match
  })
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("tr")

  useEffect(() => {
    // Load language preference from localStorage
    const savedLanguage = localStorage.getItem("language") as Language
    if (savedLanguage && (savedLanguage === "tr" || savedLanguage === "en")) {
      setLanguage(savedLanguage)
    }
  }, [])

  const handleSetLanguage = (newLanguage: Language) => {
    setLanguage(newLanguage)
    localStorage.setItem("language", newLanguage)
  }

  const t = (key: keyof typeof tr, params?: Record<string, string | number>): string => {
    const translation = translations[language]?.[key] || translations.en?.[key] || key
    return formatTranslation(translation, params)
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
