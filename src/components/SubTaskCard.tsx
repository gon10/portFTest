import React from "react";

export default function SubTaskCard(props: {
  subTasks: {
    __typename?: "SubTask";
    title: string;
    description?: string;
    status: string;
  }[];
}) {
  if (props.subTasks) {
    return (
      <div>
        {props.subTasks.map((subtask, i) => (
          <p key={i}>{subtask.title}</p>
        ))}
      </div>
    );
  }
  return <div>There is no sub tasks</div>;
}
