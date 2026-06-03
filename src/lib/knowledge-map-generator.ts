import { prisma } from "./db";

export async function generateRedesignedKnowledgeMap(
  userId: string,
  documentId: string,
  summaryResult: any,
  originalTitle: string,
  summaryId: string
) {
  try {
    const cleanTitle = originalTitle.replace(/\.[^/.]+$/, "");

    // 1. Delete existing knowledge map nodes for this document
    await prisma.knowledgeMap.deleteMany({
      where: { userId, category: cleanTitle },
    });

    const colors = {
      root: "#00F5D4",         // Teal
      concepts: "#8B5CF6",     // Purple
      tech: "#FF8A00",         // Orange
      architecture: "#38BDF8", // Blue
      workflow: "#EC4899",     // Pink
      futureScope: "#10B981",  // Green
    };

    const centerX = 50;
    const centerY = 50;

    // 2. Create the Document Root Node
    const rootNode = await prisma.knowledgeMap.create({
      data: {
        userId,
        topic: cleanTitle,
        category: cleanTitle, // used to group all nodes belonging to this document
        relevance: 100,
        color: colors.root,
        points: JSON.stringify([
          summaryResult.tldr || summaryResult.executiveBrief || "Source document node"
        ]),
        connections: "[]",
        x: centerX,
        y: centerY,
      },
    });

    // 3. Create the Category Folder Nodes
    const categoriesToCreate = [
      { name: "Concepts", color: colors.concepts, points: ["Core concepts and theories extracted from the document."] },
      { name: "Technologies", color: colors.tech, points: ["Detected technical stack, frameworks, tools, and libraries."] },
      { name: "Architecture", color: colors.architecture, points: [summaryResult.architecture || "Document structural architecture."] },
      { name: "Workflow", color: colors.workflow, points: [summaryResult.methodology || "Workflow process and methodologies."] },
      { name: "Future Scope", color: colors.futureScope, points: [summaryResult.futureScope || "Future scope and unresolved directions."] },
    ];

    const categoryNodes: any[] = [];
    const angleStep = (2 * Math.PI) / categoriesToCreate.length;
    const categoryRadius = 15;

    for (let i = 0; i < categoriesToCreate.length; i++) {
      const cat = categoriesToCreate[i];
      const angle = i * angleStep;
      const node = await prisma.knowledgeMap.create({
        data: {
          userId,
          topic: cat.name,
          category: cleanTitle,
          relevance: 90 - (i * 2), // slightly cascading relevance
          color: cat.color,
          points: JSON.stringify(cat.points),
          connections: "[]",
          x: centerX + categoryRadius * Math.cos(angle),
          y: centerY + categoryRadius * Math.sin(angle),
        },
      });
      categoryNodes.push(node);
    }

    // Connect Root to the Category Nodes
    await prisma.knowledgeMap.update({
      where: { id: rootNode.id },
      data: {
        connections: JSON.stringify(categoryNodes.map((n) => n.id)),
      },
    });

    // 4. Create Individual Concept Nodes (connected to the 'Concepts' category node)
    const conceptsCatNode = categoryNodes.find((n) => n.topic === "Concepts");
    const conceptNodes: any[] = [];
    if (conceptsCatNode) {
      const parsedConcepts = typeof summaryResult.concepts === "string"
        ? JSON.parse(summaryResult.concepts)
        : summaryResult.concepts;

      if (Array.isArray(parsedConcepts) && parsedConcepts.length > 0) {
        const conceptAngleStep = (2 * Math.PI) / parsedConcepts.length;
        const conceptRadius = 28;
        const conceptCenterX = conceptsCatNode.x;
        const conceptCenterY = conceptsCatNode.y;

        for (let i = 0; i < parsedConcepts.length; i++) {
          const concept = parsedConcepts[i];
          const angle = i * conceptAngleStep;
          const node = await prisma.knowledgeMap.create({
            data: {
              userId,
              topic: concept.name || concept.term || `Concept ${i + 1}`,
              category: cleanTitle,
              relevance: concept.relevance || Math.round(75 + Math.random() * 20),
              color: colors.concepts,
              points: JSON.stringify([
                concept.explanation || concept.definition || `Key concept from ${cleanTitle}`
              ]),
              connections: "[]",
              x: conceptCenterX + conceptRadius * Math.cos(angle),
              y: conceptCenterY + conceptRadius * Math.sin(angle),
            },
          });
          conceptNodes.push(node);
        }

        // Link Concepts Category Node to individual Concept Nodes
        await prisma.knowledgeMap.update({
          where: { id: conceptsCatNode.id },
          data: {
            connections: JSON.stringify(conceptNodes.map((n) => n.id)),
          },
        });
      }
    }

    // 5. Create Individual Technology Nodes (connected to the 'Technologies' category node)
    const techCatNode = categoryNodes.find((n) => n.topic === "Technologies");
    const techNodes: any[] = [];
    if (techCatNode) {
      const parsedTech = typeof summaryResult.technologyStack === "string"
        ? JSON.parse(summaryResult.technologyStack)
        : summaryResult.technologyStack;

      if (Array.isArray(parsedTech) && parsedTech.length > 0) {
        const techAngleStep = (2 * Math.PI) / parsedTech.length;
        const techRadius = 28;
        const techCenterX = techCatNode.x;
        const techCenterY = techCatNode.y;

        for (let i = 0; i < parsedTech.length; i++) {
          const tech = parsedTech[i];
          const angle = i * techAngleStep;
          const node = await prisma.knowledgeMap.create({
            data: {
              userId,
              topic: tech.name || `Technology ${i + 1}`,
              category: cleanTitle,
              relevance: 80,
              color: colors.tech,
              points: JSON.stringify([
                tech.context || tech.category || `Technology stack element`
              ]),
              connections: "[]",
              x: techCenterX + techRadius * Math.cos(angle),
              y: techCenterY + techRadius * Math.sin(angle),
            },
          });
          techNodes.push(node);
        }

        // Link Technologies Category Node to individual Tech Nodes
        await prisma.knowledgeMap.update({
          where: { id: techCatNode.id },
          data: {
            connections: JSON.stringify(techNodes.map((n) => n.id)),
          },
        });
      }
    }

    console.log(`[Knowledge Map Generator] Successfully created structured nodes for: ${originalTitle}`);
  } catch (error) {
    console.error("[Knowledge Map Generator] Error generating redesigned map:", error);
  }
}
