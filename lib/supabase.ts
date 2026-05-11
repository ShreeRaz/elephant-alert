// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ebhvroepnkrlwcjrcpgy.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImViaHZyb2VwbmtybHdjanJjcGd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1MDM1ODksImV4cCI6MjA5NDA3OTU4OX0._m_nlDUn6sv7FSXKA_nQgWnzz51ZdQ7ASJ7p1Ctq21Q'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
