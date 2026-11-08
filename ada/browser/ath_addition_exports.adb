with Ath_Addition;

package body Ath_Addition_Exports is
   use type Ath_Addition.Status_Code;

   Stored : Long_Float := 0.0;

   function Ath_Add_F64
     (Left, Right : Long_Float) return Interfaces.Integer_32
   is
      Result : Long_Float;
      Status : Ath_Addition.Status_Code;
   begin
      Ath_Addition.Add (Left, Right, Result, Status);
      if Status = Ath_Addition.Ok then
         Stored := Result;
      else
         Stored := 0.0;
      end if;
      return Interfaces.Integer_32 (Status);
   end Ath_Add_F64;

   function Ath_Last_Sum return Long_Float is
   begin
      return Stored;
   end Ath_Last_Sum;
end Ath_Addition_Exports;
