-- CreateTable
CREATE TABLE "submissions" (
    "id" TEXT NOT NULL,
    "landing_page_url" TEXT,
    "business_desc" TEXT,
    "clm_score" INTEGER,
    "personalisation_score" INTEGER,
    "data_availability" TEXT,
    "lifecycle_gaps" JSONB,
    "data_sources" JSONB,
    "data_source_other" TEXT,
    "scraped_data" JSONB,
    "generated_flow" JSONB,
    "webhook_summary" JSONB,
    "email" TEXT,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_captures" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "source" TEXT DEFAULT 'flow_wizard',
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_captures_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "submissions_email_idx" ON "submissions"("email");

-- CreateIndex
CREATE INDEX "submissions_created_at_idx" ON "submissions"("created_at");

-- CreateIndex
CREATE INDEX "email_captures_email_idx" ON "email_captures"("email");

-- CreateIndex
CREATE INDEX "email_captures_created_at_idx" ON "email_captures"("created_at");
