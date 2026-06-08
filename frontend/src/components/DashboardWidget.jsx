import React from "react";

const DashboardWidget = ({
  title,
  items,
  emptyText,
  renderItem
}) => {

  return (

    <div className="dashboard-widget">

      <h2>{title}</h2>

      {
        items.length===0 ?

        <div className="widget-empty">
          {emptyText}
        </div>

        :

        items.map(renderItem)
      }

    </div>

  );

};

export default DashboardWidget;