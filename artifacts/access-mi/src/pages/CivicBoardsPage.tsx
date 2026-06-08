import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Landmark, ArrowLeft } from "lucide-react";
import Layout from "@/components/layout/Layout";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePageMeta } from "@/hooks/usePageMeta";
import { MICHIGAN_BOARDS, BOARD_CATEGORIES } from "@/data/civicBoards";
import BoardCard from "@/components/civic/BoardCard";

const CivicBoardsPage = () => {
  usePageMeta({
    title: "Where to Serve - Governing Boards - Access Michigan",
    description: "15 types of Michigan governing boards where residents can apply. Health, housing, transit, environment, education - with how-to-apply guides.",
    path: "/civic-power/boards",
  });

  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    let boards = [...MICHIGAN_BOARDS];
    if (categoryFilter !== "all") boards = boards.filter(b => b.category === categoryFilter);
    if (difficultyFilter !== "all") boards = boards.filter(b => b.difficultyToJoin === difficultyFilter);
    return boards;
  }, [categoryFilter, difficultyFilter]);

  return (
    <Layout>
      <Breadcrumbs items={[
        { label: "Civic Power Map", href: "/civic-power" },
        { label: "Where to Serve" },
      ]} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-michigan-teal/10 via-primary/5 to-background py-12 md:py-16">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-michigan-teal/10 px-4 py-1.5">
              <Landmark className="h-4 w-4 text-michigan-teal" />
              <span className="text-sm font-medium text-michigan-teal">Where Michigan Residents Can Serve</span>
            </div>
            <h1 className="mb-3 text-3xl font-bold text-foreground md:text-4xl">
              ~50,000 Governing Board Seats
            </h1>
            <p className="text-base text-muted-foreground">
              Only 7% of governing board members found their seat through public channels. Here are {MICHIGAN_BOARDS.length} board types - with who appoints, compensation, time commitment, and how to apply.
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">Santa Cruz County 2025 Boards Survey · Michigan statutory authorities</p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="container py-6">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={categoryFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setCategoryFilter("all")}
          >
            All ({MICHIGAN_BOARDS.length})
          </Button>
          {BOARD_CATEGORIES.map(cat => (
            <Button
              key={cat.key}
              variant={categoryFilter === cat.key ? "default" : "outline"}
              size="sm"
              onClick={() => setCategoryFilter(cat.key)}
            >
              {cat.label} ({cat.count})
            </Button>
          ))}
          <div className="w-px bg-border mx-1" />
          {(["easy", "moderate", "competitive"] as const).map(d => (
            <Button
              key={d}
              variant={difficultyFilter === d ? "default" : "outline"}
              size="sm"
              onClick={() => setDifficultyFilter(difficultyFilter === d ? "all" : d)}
              className="capitalize"
            >
              {d === "easy" ? "Easy to Join" : d === "competitive" ? "Competitive" : "Moderate"}
            </Button>
          ))}
        </div>
      </section>

      {/* Board Cards */}
      <section className="container pb-10">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((board, i) => (
            <motion.div
              key={board.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: Math.min(i * 0.05, 0.3) }}
            >
              <BoardCard board={board} />
            </motion.div>
          ))}
        </div>
        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-12">No boards match your filters.</p>
        )}
      </section>

      {/* National Comparison Callouts */}
      <section className="container pb-12">
        <h2 className="text-base font-bold text-foreground mb-4">National Context</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { stat: "87%", label: "of hospital board members are white", source: "AHA 2019" },
            { stat: "26.5%", label: "of FQHC board members are truly representative consumers", source: "Wright, JHPPL 2013" },
            { stat: "99%", label: "of US jurisdictions: renters underrepresented on housing boards", source: "Urban Institute 2023" },
            { stat: "45%", label: "of land-use boards are 95%+ white", source: "Urban Institute 2023" },
          ].map(item => (
            <Card key={item.stat} className="border-amber-200/50 dark:border-amber-900/30">
              <CardContent className="py-4 text-center">
                <p className="text-2xl font-bold text-amber-700 dark:text-amber-400 tabular-nums">{item.stat}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
                <p className="text-[9px] text-muted-foreground/60 mt-1">{item.source}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="container pb-8">
        <Button asChild variant="outline">
          <Link to="/civic-power"><ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back to Civic Power Map</Link>
        </Button>
      </section>
    </Layout>
  );
};

export default CivicBoardsPage;
