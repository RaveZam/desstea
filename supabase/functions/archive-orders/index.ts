import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const CRON_SECRET = Deno.env.get('CRON_SECRET') ?? ''

interface BranchRow {
  branch_id: string
  branch_name: string
  year_month: string
  total_orders: number
  total_revenue: number
  top_product_name: string | null
  top_product_revenue: number | null
  top_product_quantity: number | null
}

function buildCSV(rows: BranchRow[]): string {
  const header =
    'branch_name,year_month,total_orders,total_revenue,top_product_name,top_product_revenue,top_product_quantity'
  const lines = rows.map((r) =>
    [
      `"${(r.branch_name ?? '').replace(/"/g, '""')}"`,
      r.year_month,
      r.total_orders,
      Number(r.total_revenue).toFixed(2),
      r.top_product_name ? `"${r.top_product_name.replace(/"/g, '""')}"` : '',
      r.top_product_revenue != null ? Number(r.top_product_revenue).toFixed(2) : '',
      r.top_product_quantity ?? '',
    ].join(',')
  )
  return [header, ...lines].join('\n')
}

Deno.serve(async (req: Request) => {
  // Verify cron secret
  const secret = req.headers.get('x-cron-secret')
  if (!CRON_SECRET || secret !== CRON_SECRET) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

  // Cutoff = first day of (current month - 6 months) in UTC
  const now = new Date()
  const cutoff = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 6, 1))
  const cutoffISO = cutoff.toISOString()

  const { data: months, error: monthsErr } = await supabase.rpc(
    'get_archive_eligible_months',
    { cutoff: cutoffISO }
  )

  if (monthsErr) {
    console.error('get_archive_eligible_months error:', monthsErr)
    return new Response(JSON.stringify({ error: monthsErr.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (!months || months.length === 0) {
    return new Response(JSON.stringify({ message: 'Nothing to archive', archived: [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const archived: { month: string; path: string; orders: number; branches: number }[] = []

  for (const { year_month } of months as { year_month: string }[]) {
    const { data: rows, error: dataErr } = await supabase.rpc('get_month_archive_data', {
      target_month: year_month,
    })

    if (dataErr || !rows || rows.length === 0) {
      console.error(`Skipping ${year_month}:`, dataErr)
      continue
    }

    const csv = buildCSV(rows as BranchRow[])
    const storagePath = `${year_month}-monthly-report.csv`

    const { error: uploadErr } = await supabase.storage
      .from('desstea-archives')
      .upload(storagePath, new Blob([csv], { type: 'text/csv' }), {
        upsert: true,
        contentType: 'text/csv',
      })

    if (uploadErr) {
      console.error(`Upload failed for ${year_month}:`, uploadErr)
      continue
    }

    // Delete in FK-safe order: addons → items → orders
    const { data: deletedCount, error: deleteErr } = await supabase.rpc('delete_month_orders', {
      target_month: year_month,
    })

    if (deleteErr) {
      console.error(`Delete failed for ${year_month}:`, deleteErr)
      // CSV is already uploaded; next run will upsert CSV and retry delete
      continue
    }

    const branchRows = rows as BranchRow[]
    const totalOrders = branchRows.reduce((s, r) => s + Number(r.total_orders), 0)
    const totalRevenue = branchRows.reduce((s, r) => s + Number(r.total_revenue), 0)

    const { error: logErr } = await supabase.from('archive_log').insert({
      year_month,
      branch_count: branchRows.length,
      order_count: totalOrders,
      total_revenue: totalRevenue,
      storage_path: storagePath,
    })

    if (logErr) {
      console.error(`Archive log insert failed for ${year_month}:`, logErr)
    }

    archived.push({
      month: year_month,
      path: storagePath,
      orders: deletedCount as number,
      branches: branchRows.length,
    })
  }

  return new Response(JSON.stringify({ message: 'Archive complete', archived }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
})
