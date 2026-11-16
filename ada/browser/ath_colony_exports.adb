with Ada.Numerics.Long_Elementary_Functions;
with Ath_Colony;
with Ath_Galaxy;

package body Ath_Colony_Exports is
   use type Interfaces.Integer_32;

   Last_Alive    : Long_Float := 0.0;
   Last_Distance : Long_Float := 0.0;
   Last_Hops     : Long_Float := 0.0;
   Last_Fill     : Long_Float := 0.0;

   function Ath_Colony_Left return Long_Float is
   begin
      return Ath_Colony.Left_After;
   end Ath_Colony_Left;

   function Ath_Colony_Self return Long_Float is
   begin
      return Ath_Colony.Self_Deaths;
   end Ath_Colony_Self;

   function Ath_Colony_Other return Long_Float is
   begin
      return Ath_Colony.Other_Deaths;
   end Ath_Colony_Other;

   function Choice_Of (Choice : Interfaces.Integer_32) return Positive is
   begin
      if Choice <= 1 then
         return 1;
      elsif Choice = 2 then
         return 2;
      else
         return 3;
      end if;
   end Choice_Of;

   function Ath_Colony_Escapers (Choice : Interfaces.Integer_32) return Long_Float is
   begin
      return Ath_Colony.Escapers (Choice_Of (Choice));
   end Ath_Colony_Escapers;

   function Ath_Colony_Survivors
     (Choice : Interfaces.Integer_32;
      Years  : Long_Float) return Interfaces.Integer_32 is
      Status : Ath_Colony.Status_Code;
   begin
      Ath_Colony.Survivors (Choice_Of (Choice), Years, Last_Alive, Last_Distance, Status);
      return Status;
   end Ath_Colony_Survivors;

   function Ath_Colony_Alive return Long_Float is
   begin
      return Last_Alive;
   end Ath_Colony_Alive;

   function Ath_Colony_Distance return Long_Float is
   begin
      return Last_Distance;
   end Ath_Colony_Distance;

   function Ath_Colony_Life_Of (Slider : Long_Float) return Long_Float is
   begin
      return Ath_Colony.Life_Of (Slider);
   end Ath_Colony_Life_Of;

   function Ath_Colony_Slider_Of (Years : Long_Float) return Long_Float is
   begin
      return Ath_Colony.Slider_Of (Years);
   end Ath_Colony_Slider_Of;

   function Ath_Colony_Cell_Count return Interfaces.Integer_32 is
   begin
      return Interfaces.Integer_32 (Ath_Colony.Cell_Count);
   end Ath_Colony_Cell_Count;

   function Ath_Colony_Cell_Role
     (Index  : Interfaces.Integer_32;
      Choice : Interfaces.Integer_32) return Interfaces.Integer_32 is
   begin
      if Index < 1 then
         return 0;
      end if;
      return Ath_Colony.Cell_Role (Positive (Index), Choice_Of (Choice));
   end Ath_Colony_Cell_Role;

   function Ath_Colony_Fill
     (Hop_Ly    : Long_Float;
      Hop_Years : Long_Float) return Interfaces.Integer_32 is
      Status : Ath_Colony.Status_Code;
   begin
      Ath_Colony.Fill (Hop_Ly, Hop_Years, Last_Hops, Last_Fill, Status);
      return Status;
   end Ath_Colony_Fill;

   function Ath_Colony_Hops return Long_Float is
   begin
      return Last_Hops;
   end Ath_Colony_Hops;

   function Ath_Colony_Fill_Years return Long_Float is
   begin
      return Last_Fill;
   end Ath_Colony_Fill_Years;

   function Ath_Colony_Times
     (Life_Years : Long_Float;
      Fill_Years : Long_Float) return Long_Float is
   begin
      return Ath_Colony.Times_Over (Life_Years, Fill_Years);
   end Ath_Colony_Times;

   function Ath_Colony_Star_Count return Interfaces.Integer_32 is
   begin
      return Interfaces.Integer_32 (Ath_Colony.Star_Count);
   end Ath_Colony_Star_Count;

   function Ath_Colony_Star_X (Index : Interfaces.Integer_32) return Long_Float is
      X, Y : Long_Float;
   begin
      if Index < 1 or else Index > Ath_Colony.Star_Count then
         return 0.0;
      end if;
      Ath_Colony.Star (Positive (Index), X, Y);
      return X;
   end Ath_Colony_Star_X;

   function Ath_Colony_Star_Y (Index : Interfaces.Integer_32) return Long_Float is
      X, Y : Long_Float;
   begin
      if Index < 1 or else Index > Ath_Colony.Star_Count then
         return 0.0;
      end if;
      Ath_Colony.Star (Positive (Index), X, Y);
      return Y;
   end Ath_Colony_Star_Y;

   function Ath_Colony_Generation
     (Index   : Interfaces.Integer_32;
      Origin  : Interfaces.Integer_32;
      Hop_Ly  : Long_Float) return Interfaces.Integer_32 is
   begin
      if Index < 1 or else Origin < 1
        or else Index > Ath_Colony.Star_Count
        or else Origin > Ath_Colony.Star_Count
      then
         return -1;
      end if;
      return Ath_Colony.Generation (Positive (Index), Positive (Origin), Hop_Ly);
   end Ath_Colony_Generation;

   function Ath_Colony_Sample_Count return Interfaces.Integer_32 is
   begin
      return Interfaces.Integer_32 (Ath_Colony.Sample_Count);
   end Ath_Colony_Sample_Count;

   function Ath_Colony_Sample_Years (Index : Interfaces.Integer_32) return Long_Float is
   begin
      if Index < 1 then
         return Ath_Colony.Life_Min;
      end if;
      return Ath_Colony.Sample_Years (Positive (Index));
   end Ath_Colony_Sample_Years;

   function Ath_Colony_Window return Long_Float is
   begin
      return Ath_Galaxy.Window_Years;
   end Ath_Colony_Window;

   function Ath_Colony_Radius return Long_Float is
   begin
      return Ath_Galaxy.Disc_Radius_Ly;
   end Ath_Colony_Radius;

   function Ath_Colony_Life_Min return Long_Float is
   begin
      return Ath_Colony.Life_Min;
   end Ath_Colony_Life_Min;

   function Ath_Colony_Life_Max return Long_Float is
   begin
      return Ath_Colony.Life_Max;
   end Ath_Colony_Life_Max;

   function Ath_Colony_Hop_Min return Long_Float is
   begin
      return 100.0;
   end Ath_Colony_Hop_Min;

   function Ath_Colony_Hop_Max return Long_Float is
   begin
      return 10_000.0;
   end Ath_Colony_Hop_Max;

   function Ath_Colony_Time_Min return Long_Float is
   begin
      return 1_000.0;
   end Ath_Colony_Time_Min;

   function Ath_Colony_Time_Max return Long_Float is
   begin
      return 1.0e6;
   end Ath_Colony_Time_Max;

   function Log_Span (Slider, Low, High : Long_Float) return Long_Float is
      Phase : Long_Float := Slider;
   begin
      if not (Phase >= 0.0) then
         Phase := 0.0;
      elsif Phase > 1.0 then
         Phase := 1.0;
      end if;
      return Low * Ada.Numerics.Long_Elementary_Functions.Exp
        (Phase * Ada.Numerics.Long_Elementary_Functions.Log (High / Low));
   end Log_Span;

   function Ath_Colony_Hop_Of (Slider : Long_Float) return Long_Float is
   begin
      return Log_Span (Slider, Ath_Colony_Hop_Min, Ath_Colony_Hop_Max);
   end Ath_Colony_Hop_Of;

   function Ath_Colony_Time_Of (Slider : Long_Float) return Long_Float is
   begin
      return Log_Span (Slider, Ath_Colony_Time_Min, Ath_Colony_Time_Max);
   end Ath_Colony_Time_Of;
end Ath_Colony_Exports;
