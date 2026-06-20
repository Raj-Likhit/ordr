"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Trash2, Heart, ExternalLink } from "lucide-react";
import Image from "next/image";
import { useToast } from "@/hooks/useToast";

export default function WishlistsPage() {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newGroupName, setNewGroupName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    fetchGroups();
  }, []);

  async function fetchGroups() {
    setLoading(true);
    try {
      const res = await fetch("/api/wishlists/groups");
      if (res.ok) {
        setGroups(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateGroup(e: React.FormEvent) {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    setIsCreating(true);
    try {
      const res = await fetch("/api/wishlists/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newGroupName }),
      });
      if (res.ok) {
        setNewGroupName("");
        await fetchGroups();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsCreating(false);
    }
  }

  async function handleDeleteGroup(id: string, name: string) {
    try {
      // Optimistically remove from UI
      const previousGroups = [...groups];
      setGroups(groups.filter(g => g.id !== id));
      
      const res = await fetch(`/api/wishlists/groups/${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast({
          message: `Deleted wishlist "${name}"`,
          type: "neutral",
          duration: 4000
        });
      } else {
        setGroups(previousGroups);
      }
    } catch (e) {
      console.error(e);
      fetchGroups();
    }
  }

  async function handleRemoveItem(groupId: string, item: any) {
    try {
      // Optimistically remove from UI
      const previousGroups = [...groups];
      setGroups(groups.map(g => {
        if (g.id === groupId) {
          return { ...g, items: g.items.filter((i: any) => i.id !== item.id) };
        }
        return g;
      }));

      const res = await fetch(`/api/wishlists/items/${item.id}`, { method: "DELETE" });
      if (res.ok) {
        showToast({
          message: `Removed ${item.product.name}`,
          type: "neutral",
          duration: 5000,
          action: {
            label: "Undo",
            onClick: async () => {
              // Re-add the item
              await fetch("/api/wishlists/items", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ group_id: groupId, product_id: item.product.id }),
              });
              fetchGroups();
            }
          }
        });
      } else {
        setGroups(previousGroups);
      }
    } catch (e) {
      console.error(e);
      fetchGroups();
    }
  }

  if (loading) return <div className="p-8 text-center">Loading wishlists...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-display flex items-center gap-3">
          <Heart size={28} className="text-[var(--color-accent)]" /> Your Wishlists
        </h1>
        
        <form onSubmit={handleCreateGroup} className="flex gap-2 w-full md:w-auto">
          <input 
            type="text" 
            placeholder="New wishlist name" 
            className="border border-[var(--color-border)] rounded-md px-3 py-2 flex-1 md:w-64 focus:outline-none focus:border-[var(--color-accent)] text-[var(--text-small)]"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
          />
          <button 
            type="submit" 
            disabled={isCreating || !newGroupName.trim()}
            className="bg-[var(--color-bg-dark)] text-white px-4 py-2 rounded-md hover:bg-black/80 transition-colors disabled:opacity-50 flex items-center gap-2 text-[var(--text-small)] font-medium"
          >
            <Plus size={16} /> Create
          </button>
        </form>
      </div>

      {groups.length === 0 ? (
        <div className="text-center py-16 bg-[var(--color-bg-dark)]/5 rounded-lg border border-[var(--color-border)] border-dashed">
          <Heart size={48} className="mx-auto text-[var(--color-text-muted)] mb-4" />
          <h3 className="text-xl font-medium mb-2">No wishlists yet</h3>
          <p className="text-[var(--color-text-secondary)]">Create a group above to start saving your favorite items.</p>
        </div>
      ) : (
        <div className="space-y-10">
          {groups.map(group => (
            <div key={group.id} className="border border-[var(--color-border)] rounded-lg overflow-hidden bg-white">
              <div className="bg-[var(--color-bg-dark)]/5 px-6 py-4 flex justify-between items-center border-b border-[var(--color-border)]">
                <div>
                  <h2 className="text-lg font-medium">{group.name}</h2>
                  <p className="text-[var(--text-micro)] text-[var(--color-text-muted)] mt-1">
                    {group.items?.length || 0} items
                  </p>
                </div>
                <button 
                  onClick={() => handleDeleteGroup(group.id, group.name)}
                  className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-error)] hover:bg-[var(--color-error)]/10 rounded-md transition-colors"
                  aria-label="Delete List"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="p-6">
                {!group.items || group.items.length === 0 ? (
                  <p className="text-[var(--text-small)] text-[var(--color-text-muted)]">This list is empty.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {group.items.map((item: any) => (
                      <div key={item.id} className="group relative">
                        <Link href={`/shop/${item.product.id}`} className="block">
                          <div className="aspect-square bg-[var(--color-bg-dark)]/5 rounded-md overflow-hidden relative mb-3">
                            {item.product.images?.[0] ? (
                              <Image 
                                src={item.product.images[0]} 
                                alt={item.product.name}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[var(--color-text-muted)]">
                                No image
                              </div>
                            )}
                          </div>
                          <h3 className="text-[var(--text-small)] font-medium truncate">{item.product.name}</h3>
                          <p className="text-[var(--text-small)] text-[var(--color-text-secondary)] mt-1">
                            ${item.product.price}
                          </p>
                        </Link>
                        
                        <button 
                          onClick={(e) => { e.preventDefault(); handleRemoveItem(group.id, item); }}
                          className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow-sm text-[var(--color-text-muted)] hover:text-[var(--color-error)] opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
