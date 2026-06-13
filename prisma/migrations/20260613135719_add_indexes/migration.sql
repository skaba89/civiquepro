-- CreateIndex
CREATE INDEX "GovernmentMember_active_idx" ON "GovernmentMember"("active");

-- CreateIndex
CREATE INDEX "LegalUpdate_status_idx" ON "LegalUpdate"("status");

-- CreateIndex
CREATE INDEX "LegalUpdate_category_idx" ON "LegalUpdate"("category");

-- CreateIndex
CREATE INDEX "LegalUpdate_impact_idx" ON "LegalUpdate"("impact");

-- CreateIndex
CREATE INDEX "LegalUpdate_createdAt_idx" ON "LegalUpdate"("createdAt");

-- CreateIndex
CREATE INDEX "QuestionSuggestion_legalUpdateId_idx" ON "QuestionSuggestion"("legalUpdateId");

-- CreateIndex
CREATE INDEX "QuestionSuggestion_status_idx" ON "QuestionSuggestion"("status");

-- CreateIndex
CREATE INDEX "QuizResult_userId_idx" ON "QuizResult"("userId");

-- CreateIndex
CREATE INDEX "QuizResult_quizType_idx" ON "QuizResult"("quizType");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "VeilleLog_action_idx" ON "VeilleLog"("action");

-- CreateIndex
CREATE INDEX "VeilleLog_createdAt_idx" ON "VeilleLog"("createdAt");
