using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace WaterMango.Models
{
    public class PlantDetail
    {   
        public Int32 PlantId { get; set; }
        public string PlantName { get; set; }
        public DateTime? WateredLast { get; set; }
        public String Status { get; set; }
    }
}
