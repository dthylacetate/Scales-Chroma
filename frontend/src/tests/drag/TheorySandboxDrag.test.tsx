import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TheorySandbox } from "../../pages/TheorySandbox";

describe("TheorySandbox drag composition", () => {
  it("adds a theory block to the composition lane when dragged from the library", () => {
    render(<TheorySandbox />);

    dragTheoryBlock("Dorian");

    const lane = screen.getByLabelText("乐理编排轨道");
    expect(within(lane).getByText("Dorian")).toBeInTheDocument();
    expect(screen.getByText("wave")).toBeInTheDocument();
  });

  it("lets the visual stage accept dragged theory blocks directly", () => {
    render(<TheorySandbox />);

    dragTheoryBlockToStage("Maj7");

    const lane = screen.getByLabelText("乐理编排轨道");
    expect(within(lane).getByText("Maj7")).toBeInTheDocument();
    expect(screen.getByText("soft-orb")).toBeInTheDocument();
  });

  it("removes a block from the composition lane", () => {
    render(<TheorySandbox />);

    dragTheoryBlock("Maj7");
    fireEvent.click(screen.getByRole("button", { name: "移除 Maj7" }));

    expect(screen.getByText("把乐理积木拖到这里")).toBeInTheDocument();
  });

  it("shows an invalid-combination hint when the same block is dropped twice in a row", () => {
    render(<TheorySandbox />);

    dragTheoryBlock("Dim7");
    dragTheoryBlock("Dim7");

    expect(screen.getByText("相邻位置不能重复同一个乐理积木")).toBeInTheDocument();
  });

  it("reorders blocks inside the composition lane", () => {
    render(<TheorySandbox />);

    dragTheoryBlock("Dorian");
    dragTheoryBlock("Dim7");
    reorderLaneBlock("Dim7", "Dorian");

    const lane = screen.getByLabelText("乐理编排轨道");
    expect(lane.textContent).toMatch(/Dim7.*Dorian/);
    expect(screen.getByText("wave")).toBeInTheDocument();
  });

  it("replaces a lane block when a library block is dropped on it", () => {
    render(<TheorySandbox />);

    dragTheoryBlock("Maj7");
    dragTheoryBlock("Dorian");
    replaceLaneBlock("Phrygian", "Dorian");

    const lane = screen.getByLabelText("乐理编排轨道");
    expect(within(lane).getByText("Maj7")).toBeInTheDocument();
    expect(within(lane).getByText("Phrygian")).toBeInTheDocument();
    expect(within(lane).queryByText("Dorian")).not.toBeInTheDocument();
    expect(screen.getByText("soft-orb")).toBeInTheDocument();
    expect(screen.getByText("flowing")).toBeInTheDocument();
  });
});

function dragTheoryBlock(name: string): void {
  const block = screen.getByRole("button", { name: libraryButtonName(name) });
  const lane = screen.getByLabelText("乐理编排轨道");

  fireEvent.dragStart(block, {
    dataTransfer: createDataTransfer(),
  });
  fireEvent.dragOver(lane);
  fireEvent.drop(lane, {
    dataTransfer: createDataTransfer(name.toLowerCase()),
  });
}

function reorderLaneBlock(sourceName: string, targetName: string): void {
  const source = screen.getByLabelText(`移动 ${sourceName}`);
  const target = screen.getByLabelText(`移动 ${targetName}`);
  const sourceIndex = source.getAttribute("data-lane-index") ?? "0";
  const dragData = `lane:${sourceIndex}`;

  fireEvent.dragStart(source, {
    dataTransfer: createDataTransfer(dragData),
  });
  fireEvent.dragOver(target, {
    dataTransfer: createDataTransfer(dragData),
  });
  fireEvent.drop(target, {
    dataTransfer: createDataTransfer(dragData),
  });
}

function dragTheoryBlockToStage(name: string): void {
  const block = screen.getByRole("button", { name: libraryButtonName(name) });
  const stage = screen.getByLabelText("视觉舞台拖放区");

  fireEvent.dragStart(block, {
    dataTransfer: createDataTransfer(),
  });
  fireEvent.dragOver(stage, {
    dataTransfer: createDataTransfer(name.toLowerCase()),
  });
  fireEvent.drop(stage, {
    dataTransfer: createDataTransfer(name.toLowerCase()),
  });
}

function replaceLaneBlock(sourceName: string, targetName: string): void {
  const target = screen.getByLabelText(`移动 ${targetName}`);
  const dragData = sourceName.toLowerCase();

  fireEvent.dragOver(target, {
    dataTransfer: createDataTransfer(dragData),
  });
  fireEvent.drop(target, {
    dataTransfer: createDataTransfer(dragData),
  });
}

function libraryButtonName(name: string): string {
  const types: Record<string, string> = {
    Dorian: "mode",
    Dim7: "chord",
    Maj7: "chord",
  };

  return `${name} ${types[name]}`;
}

function createDataTransfer(value = ""): DataTransfer {
  const store = new Map<string, string>();

  return {
    effectAllowed: "move",
    dropEffect: "move",
    files: [] as unknown as FileList,
    items: [] as unknown as DataTransferItemList,
    types: [],
    clearData: (format?: string) => {
      if (format) {
        store.delete(format);
      } else {
        store.clear();
      }
    },
    getData: (format: string) => store.get(format) ?? value,
    setData: (format: string, data: string) => {
      store.set(format, data);
    },
    setDragImage: () => undefined,
  };
}
