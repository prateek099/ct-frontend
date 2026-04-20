import { useState } from 'react'
import PageHeader from '../components/PageHeader'
import Icon from '../components/Icon'

interface Product {
  id: string
  name: string
  price: string
  stock: number
  color: string
  type: string
}

const PRODUCTS: Product[] = [
  { id: 'p1', name: 'Creator OS Template Pack', price: '$29',  stock: 999, color: 'coral',  type: 'Digital' },
  { id: 'p2', name: 'YouTube Growth Course',    price: '$97',  stock: 999, color: 'violet', type: 'Course'  },
  { id: 'p3', name: 'Studio Logo Hoodie',        price: '$49',  stock: 14,  color: 'mint',   type: 'Merch'   },
  { id: 'p4', name: '1:1 Strategy Session',      price: '$197', stock: 4,   color: 'amber',  type: 'Service' },
]

const REVENUE_BARS = [
  { label: 'Creator OS Pack',  v: 78, amount: '$841' },
  { label: 'YouTube Course',   v: 52, amount: '$291' },
  { label: 'Studio Hoodie',    v: 28, amount: '$98'  },
  { label: '1:1 Session',      v: 15, amount: '$54'  },
]

export default function MyShop() {
  const [products, setProducts] = useState<Product[]>(PRODUCTS)

  const remove = (id: string) => setProducts(prev => prev.filter(p => p.id !== id))

  return (
    <div className="stack-24">
      <PageHeader
        eyebrow="Publish"
        code="T16"
        icon="bag"
        title={<>My <em>shop</em></>}
        subtitle="Sell merch and digital products to your audience."
        actions={
          <button className="btn primary"><Icon name="plus" size={14} /> Add product</button>
        }
      />

      <section className="grid-2-1">
        {/* Left: product grid */}
        <div className="col" style={{ gap: 16 }}>
          <div className="grid-2" style={{ gap: 16 }}>
            {products.map(p => (
              <div key={p.id} className="card">
                <div className={`thumb ${p.color}`} style={{ marginBottom: 12 }}>
                  <Icon name="bag" size={24} />
                </div>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6, lineHeight: 1.3 }}>{p.name}</div>
                <div className="row between" style={{ marginBottom: 10 }}>
                  <span className="badge mint">{p.price}</span>
                  <span className={`chip sm ${p.stock < 10 ? 'accent' : ''}`}>
                    {p.type === 'Digital' || p.type === 'Course' || p.type === 'Service' ? '∞ stock' : `${p.stock} left`}
                  </span>
                </div>
                <div className="row" style={{ gap: 6 }}>
                  <button className="btn sm" style={{ flex: 1, justifyContent: 'center' }}>
                    <Icon name="pencil" size={12} /> Edit
                  </button>
                  <button className="btn sm ghost" onClick={() => remove(p.id)}>
                    <Icon name="x" size={12} />
                  </button>
                </div>
              </div>
            ))}

            {/* Add product card */}
            <div className="card" style={{ border: '2px dashed var(--line)', display: 'grid', placeItems: 'center', cursor: 'pointer', minHeight: 180 }}>
              <div className="col" style={{ alignItems: 'center', gap: 8, opacity: 0.5 }}>
                <Icon name="plus" size={28} />
                <span className="small">Add product</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="col" style={{ gap: 16 }}>
          <div className="card">
            <div className="h2" style={{ marginBottom: 6 }}>Revenue</div>
            <div className="eyebrow" style={{ marginBottom: 14 }}>This month</div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 36, fontWeight: 700, lineHeight: 1 }}>
              $1,284
            </div>
            <div className="row" style={{ gap: 8, marginTop: 8 }}>
              <span className="badge mint">↑ +$218 vs last month</span>
            </div>

            <div style={{ height: 1, background: 'var(--line)', margin: '16px 0' }} />

            <div className="col" style={{ gap: 8 }}>
              {[
                { label: 'Orders',       val: '38' },
                { label: 'Avg order',    val: '$33.8' },
                { label: 'Conversion',   val: '2.4%' },
                { label: 'Refunds',      val: '1' },
              ].map(r => (
                <div key={r.label} className="row between small">
                  <span className="muted">{r.label}</span>
                  <b>{r.val}</b>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="h2" style={{ marginBottom: 14 }}>Top products</div>
            <div className="col" style={{ gap: 10 }}>
              {REVENUE_BARS.map(b => (
                <div key={b.label}>
                  <div className="row between small">
                    <span>{b.label}</span>
                    <b>{b.amount}</b>
                  </div>
                  <div className="bar accent" style={{ marginTop: 4 }}>
                    <i style={{ width: `${b.v}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
