using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using WaterMango.Enums;
using WaterMango.Models;
using System.Diagnostics;
using System.Web;
using Microsoft.AspNetCore.Http;
using WaterMango.App_Start;
using Microsoft.Extensions.Caching.Memory;
using Newtonsoft.Json;

namespace WaterMango.Controllers
{
    public class WaterPlantsController : Controller
    {
        private IMemoryCache _cache;
        public WaterPlantsController(IMemoryCache memoryCache)
        {
            _cache = memoryCache;
        }
        [HttpGet]
        public IActionResult Index()
        {
            try
            {   
                return View();
            }
            catch (Exception ex)
            {
                return RedirectToAction("Error", "Home", new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
            }
        }

        public JsonResult GetAll(string ids, string status)
        {
            List<PlantDetail> cacheEntry = new List<PlantDetail>();

            if (!_cache.TryGetValue(CacheKeys.Entry, out cacheEntry) || !String.IsNullOrEmpty(ids))
            {
                cacheEntry = !String.IsNullOrEmpty(ids) ? Update(ids, status, cacheEntry) : Get();

                var cacheEntryOptions = new MemoryCacheEntryOptions()
                     .SetSlidingExpiration(TimeSpan.FromDays(365));
                cacheEntryOptions.AbsoluteExpirationRelativeToNow = TimeSpan.FromDays(365);
                _cache.Set(CacheKeys.Entry, cacheEntry, cacheEntryOptions);
            }
            return Json(JsonConvert.SerializeObject(cacheEntry));
        }


        public List<PlantDetail> Get()
        {
            List<PlantDetail> Plants = new List<PlantDetail>();
            foreach (var _plant in Enum.GetValues(typeof(Plants)))
            {
                PlantDetail plant = new PlantDetail();
                plant.PlantName = _plant.ToString();
                plant.PlantId = (int)_plant;
                plant.Status = Status.NeedToWater.ToString();
                plant.WateredLast = null;
                Plants.Add(plant);
            }
            return Plants;
        }

        public List<PlantDetail> Update(string ids, string status, List<PlantDetail> cacheEntry)
        {
            List<PlantDetail> _cacheEntry = cacheEntry;
            List<PlantDetail> Plants = new List<PlantDetail>();
            foreach (var plant in _cacheEntry)
            {   
                plant.PlantName = plant.PlantName;
                plant.PlantId = plant.PlantId;
                plant.Status = ids.Contains(Convert.ToString(plant.PlantId)) ? status : plant.Status;
                plant.WateredLast = ids.Contains(Convert.ToString(plant.PlantId)) ? DateTime.Now : plant.WateredLast;
                Plants.Add(plant);
            }
            return Plants;
        }

        
    }
}